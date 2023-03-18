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

@Injectable()
export class CobranzaExternaService {

    constructor(
        @InjectRepository(ClienteView)
        private clienteViewRepo: Repository<ClienteView>,
        @InjectRepository(SuscripcionView)
        private suscripcionViewRepo: Repository<SuscripcionView>,
        @InjectRepository(CuotaView)
        private cuotaViewRepo: Repository<CuotaView>,
        private datasource: DataSource
    ){}

    async consulta(request: ConsultaRequestDTO): Promise<GenericoResponseDTO | ConsultaResponseDTO>{
        const cliente = await this.clienteViewRepo.findOneBy({ci: request.nroDocumento});
        if(!cliente) return {
            codServicio: '00001',
            codRetorno: '999',
            tipoTrx: 5,
            desRetorno: 'CLIENTE NO ENCONTRADO'
        }
        const suscripcionesActivas = await this.getSuscripcionesActivas(cliente.id);
        const suscripcionesInactivas = await this.getSuscripcionesInactivas(cliente.id);
        const suscripciones = suscripcionesActivas.concat(suscripcionesInactivas);

        const consultaCobranza: ConsultaCobranzaExterna = new ConsultaCobranzaExterna();
        consultaCobranza.codServicio = '00001';
        consultaCobranza.codRetorno = '000';
        consultaCobranza.desRetorno = cliente.razonsocial.toUpperCase();
        consultaCobranza.moneda = '1';
        consultaCobranza.nombreApellido = cliente.razonsocial;
        consultaCobranza.nroDocumento = request.nroDocumento;
        consultaCobranza.usuario = request.usuario;
        
        const detallesConsultaCobranza: DetalleConsultaCobranzaExterna[] = [];
        for(let suscripcion of suscripciones){
            for(let cuota of await this.getCuotasPendientes(suscripcion.id)){
                const detalle = new DetalleConsultaCobranzaExterna();
                detalle.consulta = consultaCobranza;
                detalle.desOperacion = `${cuota.servicio?.trim().toUpperCase()} ${format(cuota.fechavencimiento, 'MMM yyyy', {locale: es})} [${cuota.idsuscripcion}]`.toUpperCase();
                detalle.totalDetalle = Number(cuota.monto);
                if(cuota.porcentajeiva == 10) detalle.iva10 = detalle.totalDetalle / 11;
                if(cuota.porcentajeiva == 5) detalle.iva5 = detalle.totalDetalle / 21;
                detalle.fechaVencimiento = `${format(cuota.fechavencimiento, 'ddMMyyyy', {locale: es})}`;
                detalle.direccionDomicilio = suscripcion.direccion.toUpperCase();
                detalle.idcuota = cuota.id;
                detallesConsultaCobranza.push(detalle);
            }
        }

        if(detallesConsultaCobranza.length === 0) return {
            codServicio: '00001',
            codRetorno: '001',
            tipoTrx: 5,
            desRetorno: 'SIN CUOTAS'
        }

        await this.datasource.transaction(async manager => {
            await manager.save(consultaCobranza);
            for(let detalle of detallesConsultaCobranza) await manager.save(detalle);
        });

        return this.consultaCobranzaToDTO(consultaCobranza, detallesConsultaCobranza);
    }

    private async getCuotasPendientes(idsuscripcion: number): Promise<CuotaView[]>{
        return await this.cuotaViewRepo.createQueryBuilder('cuota')
        .where('cuota.idsuscripcion = :idsuscripcion', {idsuscripcion})
        .andWhere('cuota.pagado = FALSE')
        .orderBy('cuota.fechaVencimiento', 'ASC')
        .getMany();
    }

    private async getSuscripcionesActivas(idcliente: number): Promise<SuscripcionView[]>{
        return await this.suscripcionViewRepo.createQueryBuilder('suscripcion')
            .where(`suscripcion.idcliente = :idcliente`, {idcliente})
            .andWhere(new Brackets(qb => {
                qb = qb.orWhere(`suscripcion.estado = 'C'`);
                qb = qb.orWhere(`suscripcion.estado = 'R'`);
            }))
            .getMany();
    }

    private async getSuscripcionesInactivas(idcliente: number): Promise<SuscripcionView[]>{
        return await this.suscripcionViewRepo.createQueryBuilder('suscripcion')
            .where(`suscripcion.idcliente = :idcliente`, {idcliente})
            .andWhere(`suscripcion.estado = 'D'`)
            .getMany();
    }
    
    private consultaCobranzaToDTO(consulta: ConsultaCobranzaExterna, detallesConsulta: DetalleConsultaCobranzaExterna[]): ConsultaResponseDTO{
        let detalles: DetalleConsultaResponseDTO[] = [];
        for(let det of detallesConsulta){
            detalles.push({
                nroOperacion: det.nroOperacion,
                desOperacion: det.desOperacion,
                totalDetalle: det.totalDetalle.toString().replace('.', '').padStart(15, '0'),
                iva10: det.iva10.toString().replace('.','').padStart(15, '0'),
                iva5: det.iva5.toString().replace('.','').padStart(15, '0'),
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
            detalles: detalles
        }
    }

}
