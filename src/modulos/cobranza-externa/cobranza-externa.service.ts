import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { ConsultaResponseDTO } from './dto/consulta-response.dto';
import { ConsultaRequestDTO } from './dto/consulta-request.dto';
import { GenericoResponseDTO } from './dto/generico-response.dto';
import { CuotaView } from '@database/view/cuota.view';
import { DetalleConsultaResponseDTO } from './dto/detalle-consulta-response.dto';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SuscripcionView } from '@database/view/suscripcion.view';
import { ConsultaCobranzaExterna } from '@database/entity/consulta-cobranza-externa.entity';
import { DetalleConsultaCobranzaExterna } from '@database/entity/detalle-consulta-cobranza-externa.entity';
import { ClienteView } from '@database/view/cliente.view';
import { PagoRequestDTO } from './dto/pago-request.dto';
import { Venta } from '@database/entity/venta.entity';
import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { Cuota } from '@database/entity/cuota.entity';
import { Cobro } from '@database/entity/cobro.entity';
import { Usuario } from '@database/entity/usuario.entity';
import { AnulacionRequestDTO } from './dto/anulacion-request.dto';
import { Timbrado } from '@database/entity/timbrado.entity';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { EstadoEnvioEmail } from '@database/entity/facturacion/estado-envio-email.entity.dto';
import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { FacturaElectronicaUtilsService } from '@modulos/ventas/service/factura-electronica-utils.service';
import { SifenApiUtilService } from '@modulos/ventas/service/sifen-api-util.service';
import { SifenUtilService } from '@modulos/ventas/service/sifen-util.service';
import { SifenEventosUtilService } from '@modulos/ventas/service/sifen-eventos-util.service';
import { CancelacionFactura } from '@database/entity/facturacion/cancelacion-factura.entity';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';

@Injectable()
export class CobranzaExternaService {

    constructor(
        @InjectRepository(ClienteView)
        private clienteViewRepo: Repository<ClienteView>,
        @InjectRepository(SuscripcionView)
        private suscripcionViewRepo: Repository<SuscripcionView>,
        @InjectRepository(CuotaView)
        private cuotaViewRepo: Repository<CuotaView>,
        @InjectRepository(Cuota)
        private cuotaRepo: Repository<Cuota>,
        @InjectRepository(DetalleConsultaCobranzaExterna)
        private detalleConsultaCobranzaRepo: Repository<DetalleConsultaCobranzaExterna>,
        @InjectRepository(Usuario)
        private usuarioRepo: Repository<Usuario>,
        @InjectRepository(Cobro)
        private cobroRepo: Repository<Cobro>,
        @InjectRepository(Venta)
        private ventaRepo: Repository<Venta>,
        @InjectRepository(Timbrado)
        private timbradoRepo: Repository<Timbrado>,
        @InjectRepository(FacturaElectronica)
        private facturaElectronicaRepo: Repository<FacturaElectronica>,
        private datasource: DataSource,
        private facturaElectronicaUtilSrv: FacturaElectronicaUtilsService,
        private sifenApiUtilSrv: SifenApiUtilService,
        private sifenEventosUtil: SifenEventosUtilService,
        private sifenUtilsSrv: SifenUtilService
    ) { }

    async consultar(request: ConsultaRequestDTO): Promise<GenericoResponseDTO | ConsultaResponseDTO> {
        const suscripcionesActivas = await this.getSuscripcionesActivas(request.nroDocumento);
        const suscripcionesInactivas = await this.getSuscripcionesInactivas(request.nroDocumento);

        if (suscripcionesActivas.length == 0 && suscripcionesInactivas.length == 0) return {
            codServicio: '00001',
            codRetorno: '001',
            tipoTrx: 5,
            desRetorno: 'SIN CUOTAS'
        }
        const suscripciones = suscripcionesActivas.concat(suscripcionesInactivas);
        const cliente = await this.clienteViewRepo.findOneBy({ id: suscripciones[0].idcliente });
        const suscripcionesFiltered = suscripciones.filter(sus => sus.idcliente == cliente.id);

        const consultaCobranza: ConsultaCobranzaExterna = new ConsultaCobranzaExterna();
        consultaCobranza.codServicio = '00001';
        consultaCobranza.codRetorno = '000';
        consultaCobranza.desRetorno = 'CUOTAS';
        consultaCobranza.moneda = '1';
        consultaCobranza.nombreApellido = cliente.razonsocial.toUpperCase();
        consultaCobranza.nroDocumento = request.nroDocumento;
        consultaCobranza.usuario = request.usuario;
        consultaCobranza.idcliente = cliente.id;

        const detallesConsultaCobranza: DetalleConsultaCobranzaExterna[] = [];
        for (let suscripcion of suscripcionesFiltered) {
            for (let cuota of await this.getCuotasPendientes(suscripcion.id)) {
                const detalle = new DetalleConsultaCobranzaExterna();
                detalle.consulta = consultaCobranza;
                detalle.desOperacion = `${suscripcion.estado === 'D' ? '(DESCON)' : ''}${cuota.servicio?.trim().toUpperCase()} ${format(cuota.fechavencimiento, 'MMM yyyy', { locale: es })} [${cuota.idsuscripcion}]`.toUpperCase();
                detalle.totalDetalle = Number(cuota.monto);
                if (cuota.porcentajeiva == 10) detalle.iva10 = detalle.totalDetalle / 11;
                if (cuota.porcentajeiva == 5) detalle.iva5 = detalle.totalDetalle / 21;
                detalle.fechaVencimiento = `${format(cuota.fechavencimiento, 'ddMMyyyy', { locale: es })}`;
                detalle.direccionDomicilio = suscripcion.direccion.toUpperCase();
                detalle.idcuota = cuota.id;
                detallesConsultaCobranza.push(detalle);
            }
        }

        if (detallesConsultaCobranza.length === 0) return {
            codServicio: '00001',
            codRetorno: '001',
            tipoTrx: 5,
            desRetorno: 'SIN CUOTAS'
        }

        await this.datasource.transaction(async manager => {
            await manager.save(consultaCobranza);
            for (let detalle of detallesConsultaCobranza) await manager.save(detalle);
        });
        return this.consultaCobranzaToDTO(consultaCobranza, detallesConsultaCobranza);
    }

    async pagar(request: PagoRequestDTO): Promise<GenericoResponseDTO> {
        const detalleCobranza = await this.detalleConsultaCobranzaRepo.findOne({
            where: { nroOperacion: request.nroOperacion },
            relations: { consulta: true }
        });
        if (!detalleCobranza) return {
            codServicio: '00001',
            codRetorno: '999',
            desRetorno: 'NO SE ENCONTRO OPERACION',
            tipoTrx: 3
        }

        if (detalleCobranza.codTransaccionPago != null) return {
            codServicio: '00001',
            codRetorno: '999',
            desRetorno: 'OPERACION YA PROCESADA',
            tipoTrx: 3
        }
        
        const importeRequest = `${request.importe.substring(0, 13)}.${request.importe.substring(13)}`;
        if(Number(importeRequest) != Number(detalleCobranza.totalDetalle)) return {
            codServicio: '00001',
            codRetorno: '999',
            desRetorno: 'MONTO INCORRECTO',
            tipoTrx: 3
        }
        
        const cuota = await this.cuotaRepo.findOneByOrFail({id: detalleCobranza.idcuota});
        const cuotaView = await this.cuotaViewRepo.findOneByOrFail({id: detalleCobranza.idcuota});
        const usuarioCobranza = await this.usuarioRepo.findOneByOrFail({id: Number(request.usuario)});
        const suscripcionView = await this.suscripcionViewRepo.findOneByOrFail({id: cuota.idsuscripcion});
        const cobrador = await this.usuarioRepo.findOneByOrFail({id: suscripcionView.idcobrador });

        await this.datasource.transaction(async manager => {
            detalleCobranza.codTransaccionPago = request.codTransaccion;
            await manager.save(detalleCobranza);

            cuota.pagado = true;
            await manager.save(cuota);
            
            const venta = await manager.save(await this.getVenta(detalleCobranza));
            const detalle = await this.getDetalleVenta(detalleCobranza, venta, cuotaView);
            await manager.save(detalle);

            const cobro = this.getCobro(venta, usuarioCobranza, cobrador);
            cobro.codTransaccionCobranzaExterna = request.codTransaccion;
            await manager.save(cobro);

            if(venta.idtimbrado != null){
                const timbrado = await this.timbradoRepo.findOneByOrFail({id: venta.idtimbrado}); 
                
                if(timbrado.electronico){
                    const oldTimbrado = { ...timbrado };
                    timbrado.ultimoNroUsado = venta.nroFactura;
                    await manager.save(timbrado);
                    await manager.save(EventoAuditoriaUtil.getEventoAuditoriaTimbrado(Usuario.ID_USUARIO_SISTEMA, 'M', oldTimbrado, timbrado));

                    const facturaElectronica = await this.facturaElectronicaUtilSrv.generarFacturaElectronica(venta, [detalle]);
                    await manager.save(facturaElectronica);
                    
                    if(
                        !this.sifenUtilsSrv.isDisabled() &&
                        this.sifenUtilsSrv.getModo() == 'sync'
                    ) await this.sifenApiUtilSrv.enviar(facturaElectronica, manager);   
                }                
            }
        });

        return {
            codServicio: '00001',
            codRetorno: '000',
            desRetorno: 'PAGO EXITOSO',
            tipoTrx: 3
        }
    }

    async anular(anularReq: AnulacionRequestDTO): Promise<GenericoResponseDTO>{
        const detallesCobranza = await this.detalleConsultaCobranzaRepo.findBy({codTransaccionPago: anularReq.codTransaccionAnular});
        if(detallesCobranza.length === 0) return {
            codServicio: '00001',
            codRetorno: '999',
            desRetorno: 'NO SE ENCONTRO OPERACION',
            tipoTrx: 4
        }
        
        const detallesAnular = detallesCobranza.filter(detalle => detalle.codTransaccionAnulacion == null);
        const montoTotalAnular = detallesAnular
            .map(detalle => Number(detalle.totalDetalle))
            .reduce((suma, monto) => suma += monto, 0);        

        if(detallesAnular.length === 0) return {
            codServicio: '00001',
            codRetorno: '999',
            desRetorno: 'OPERACION YA ANULADA',
            tipoTrx: 4
        }

        const importeRequest = `${anularReq.importe.substring(0, 13)}.${anularReq.importe.substring(13)}`;
        if(Number(importeRequest) != montoTotalAnular) return {
            codServicio: '00001',
            codRetorno: '999',
            desRetorno: 'MONTO INCORRECTO',
            tipoTrx: 4
        }

        const cobro = await this.cobroRepo.findOneByOrFail({ codTransaccionCobranzaExterna: anularReq.codTransaccionAnular});
        const venta = await this.ventaRepo.findOneByOrFail({ id: cobro.idventa });

        await this.datasource.transaction(async manager => {
            cobro.anulado = true;
            await manager.save(cobro);

            venta.anulado = true;
            await manager.save(venta);
            
            for(let detalle of detallesAnular){
                const cuota = await this.cuotaRepo.findOneByOrFail({ id: detalle.idcuota });

                cuota.pagado = false;
                await manager.save(cuota);

                detalle.codTransaccionAnulacion = anularReq.codTransaccion;
                await manager.save(detalle);
            }

            const factElectronica = await this.facturaElectronicaRepo.findOneBy({ idventa: venta.id });
            if(factElectronica != null){
                const [{ idevento }] = await this.datasource.query(`SELECT NEXTVAL('facturacion.seq_id_evento_sifen') AS idevento`);
                const eventoXml = await this.sifenEventosUtil.getCancelacion(idevento, factElectronica)
                const eventoXmlSigned = await this.sifenEventosUtil.getEventoFirmado(eventoXml);
                const cancelacion = new CancelacionFactura();
                cancelacion.id = idevento;
                cancelacion.documento = eventoXmlSigned ?? eventoXml;
                cancelacion.fechaHora = new Date();
                cancelacion.idventa = venta.id;
                cancelacion.envioCorrecto = false;
                if(
                    factElectronica.idestadoDocumentoSifen == 1  ||
                    factElectronica.idestadoDocumentoSifen == 2
                ) cancelacion.observacion = 'Documento sin aprobación, no se envia evento a SIFEN'
                await manager.save(cancelacion);

                if(
                    (factElectronica.idestadoDocumentoSifen == EstadoDocumentoSifen.APROBADO ||
                    factElectronica.idestadoDocumentoSifen == EstadoDocumentoSifen.APROBADO_CON_OBS) &&
                    process.env.SIFEN_DISABLED != 'TRUE'
                ) await this.sifenApiUtilSrv.enviarCancelacion(cancelacion, manager);
            }
        })

        return {
            codServicio: '00001',
            codRetorno: '000',
            desRetorno: 'ANULACIÓN EXITOSA',
            tipoTrx: 4
        }
    }

    private async getVenta(detalleCobranza: DetalleConsultaCobranzaExterna): Promise<Venta> {
        const venta = new Venta();
        venta.anulado = false;
        venta.pagado = true;
        venta.eliminado = false;
        venta.idcliente = detalleCobranza.consulta.idcliente;
        venta.idusuarioRegistroFactura = 3;
        venta.total = detalleCobranza.totalDetalle;
        venta.totalIva10 = detalleCobranza.iva10;
        venta.totalIva5 = detalleCobranza.iva5;
        venta.totalGravadoIva10 = detalleCobranza.iva10;
        venta.totalGravadoIva5 = detalleCobranza.iva5;
        venta.fechaFactura = new Date();
        venta.fechaHoraFactura = new Date();

        const timbradoElectronico = await this.timbradoRepo.findOneBy({ eliminado: false, electronico: true, activo: true });
        if(timbradoElectronico){
            venta.idtimbrado = timbradoElectronico.id;
            venta.nroFactura = Number(timbradoElectronico.ultimoNroUsado ?? 0) + 1
        }
        return venta;
    }

    private getDetalleVenta(detalleCobranza: DetalleConsultaCobranzaExterna, venta: Venta, cuota: CuotaView): DetalleVenta{
        const detalleVenta = new DetalleVenta();
        detalleVenta.venta = venta;        
        detalleVenta.cantidad = 1;
        detalleVenta.descripcion = `CUOTA ${format(cuota.fechavencimiento, 'MMM yyyy', {locale: es})} | ${cuota.servicio} [${cuota.idsuscripcion}]`.toUpperCase();
        detalleVenta.eliminado = false;
        detalleVenta.idcuota = detalleCobranza.idcuota;
        detalleVenta.idservicio = cuota.idservicio;
        detalleVenta.idsuscripcion = cuota.idsuscripcion;
        detalleVenta.monto = detalleCobranza.totalDetalle;
        detalleVenta.porcentajeIva = cuota.porcentajeiva;
        detalleVenta.montoIva = detalleVenta.monto * cuota.porcentajeiva / (100 + cuota.porcentajeiva);
        detalleVenta.subtotal = detalleCobranza.totalDetalle;
        return detalleVenta;
    }

    private getCobro(venta: Venta, usuarioCobranza: Usuario, cobrador: Usuario): Cobro{
        const cobro = new Cobro();
        cobro.anulado = false;
        cobro.cobradoPor = usuarioCobranza.id;
        cobro.comisionPara = cobrador.id;
        cobro.eliminado = false;
        cobro.fecha = venta.fechaFactura;
        cobro.idventa = venta.id;
        return cobro;
    }

    private async getCuotasPendientes(idsuscripcion: number): Promise<CuotaView[]> {
        return await this.cuotaViewRepo.createQueryBuilder('cuota')
            .where('cuota.idsuscripcion = :idsuscripcion', { idsuscripcion })
            .andWhere('cuota.pagado = FALSE')
            .andWhere('cuota.eliminado = FALSE')
            .orderBy('cuota.fechaVencimiento', 'ASC')
            .getMany();
    }

    private async getSuscripcionesActivas(ci: string): Promise<SuscripcionView[]> {
        return await this.suscripcionViewRepo.createQueryBuilder('suscripcion')
            .where(`suscripcion.ci = :ci`, { ci })
            .andWhere(`suscripcion.eliminado = FALSE`)
            .andWhere(new Brackets(qb => {
                qb = qb.orWhere(`suscripcion.estado = 'C'`);
                qb = qb.orWhere(`suscripcion.estado = 'R'`);
            }))
            .getMany();
    }

    private async getSuscripcionesInactivas(ci: string): Promise<SuscripcionView[]> {
        return await this.suscripcionViewRepo.createQueryBuilder('suscripcion')
            .where(`suscripcion.ci = :ci`, { ci })
            .andWhere(`suscripcion.eliminado = FALSE`)
            .andWhere(`suscripcion.estado = 'D'`)
            .getMany();
    }

    private consultaCobranzaToDTO(consulta: ConsultaCobranzaExterna, detallesConsulta: DetalleConsultaCobranzaExterna[]): ConsultaResponseDTO {
        let detalles: DetalleConsultaResponseDTO[] = [];
        for (let det of detallesConsulta) {
            detalles.push({
                nroOperacion: det.nroOperacion,
                desOperacion: det.desOperacion,
                totalDetalle: det.totalDetalle.toString().replace('.', '').padStart(15, '0'),
                iva10: det.iva10.toString().replace('.', '').padStart(15, '0'),
                iva5: det.iva5.toString().replace('.', '').padStart(15, '0'),
                moneda: '1',
                fechaVencimiento: det.fechaVencimiento,
                direccionDomicilio: det.direccionDomicilio,
            });
        }
        return {
            codServicio: consulta.codServicio,
            tipoTrx: 5,
            codRetorno: consulta.codRetorno,
            desRetorno: consulta.desRetorno,
            cantFilas: detallesConsulta.length,
            nombreApellido: consulta.nombreApellido,
            detalles: detalles
        }
    }

}
