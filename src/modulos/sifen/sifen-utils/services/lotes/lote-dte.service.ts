import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { Lote } from '@database/entity/facturacion/lote.entity';
import { Usuario } from '@database/entity/usuario.entity';
import { Venta } from '@database/entity/venta.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { ConsultaLoteMessageService } from '../consultas/consulta-lote-message.service';
import { LoteView } from '@database/view/facturacion/lote.view';
import { DetalleLote } from '@database/entity/facturacion/lote-detalle.entity';
import { LoteDetalleView } from '@database/view/facturacion/lote-detalle.view';
import { ResultadoProcesamientoLoteType } from '../../types/lotes/resultado-procesamiento-lote.type';
import { DteXmlUtilsService } from '../dte/dte-xml-utils.service';
import { NotaCredito } from '@database/entity/facturacion/nota-credito.entity';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { NotaCreditoDetalle } from '@database/entity/facturacion/nota-credito-detalle.entity';
import { Cuota } from '@database/entity/cuota.entity';
import { DetalleVenta } from '@database/entity/detalle-venta.entity';

@Injectable()
export class LoteDteService {

    private readonly TAMANIO_LOTE = 50;

    constructor(
        @InjectRepository(Lote)
        private lotesRepo: Repository<Lote>,
        @InjectRepository(LoteView)
        private loteViewRepo: Repository<LoteView>,
        @InjectRepository(DTE)
        private dteRepo: Repository<DTE>,
        @InjectRepository(DetalleLote)
        private detalleLoteRepo: Repository<DetalleLote>,
        @InjectRepository(LoteDetalleView)
        private detalleLoteViewRepo: Repository<LoteDetalleView>,
        @InjectRepository(Venta)
        private ventaRepo: Repository<Venta>,
        @InjectRepository(DetalleVenta)
        private detalleVentaRepo: Repository<DetalleVenta>,
        @InjectRepository(NotaCredito)
        private notaCreditoRepo: Repository<NotaCredito>,
        @InjectRepository(NotaCreditoDetalle)
        private notaCreditoDetalleRepo: Repository<NotaCreditoDetalle>,
        @InjectRepository(Cuota)
        private cuotaRepo: Repository<Cuota>,
        private dteXmlUtils: DteXmlUtilsService,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<Lote>{
        const { enviado, consultado, aprobado, sort, offset, limit } = queries;
        const alias = 'lote';
        let query = this.lotesRepo.createQueryBuilder(alias);
        if(enviado != null) query = query.andWhere(`${alias}.enviado = :enviado`, { enviado });
        if(consultado != null) query = query.andWhere(`${alias}.consultado = :consultado`, { consultado });
        if(aprobado != null) query = query.andWhere(`${alias}.aprobado = :aprobado`, { aprobado });
        if(offset != null) query = queries.skip(offset);
        if(limit != null) query = query.take(limit);
        if(sort){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder); 
        }
        return query;
    }

    async findAll(queries: QueriesType): Promise<Lote[]>{
        return this.getSelectQuery(queries).getMany();
    }

    async findById(id: number): Promise<Lote>{
        return await this.lotesRepo.findOneOrFail({
            where: { id },
            relations: { detallesLote: true }
        });
    }

    async findDetallesLoteByIdLote(idlote: number, includeFactura: boolean = false): Promise<DetalleLote[]>{
        let query = this.detalleLoteRepo
            .createQueryBuilder('detalle')
            .where('detalle.idlote = :idlote', { idlote });
    
        if(includeFactura)
            query = query.leftJoinAndSelect('detalle.dte', 'facturaElectronica');
        
        return query.getMany();
    }

    private getSelectQueryView(queries: QueriesType): SelectQueryBuilder<LoteView>{
        const { enviado, consultado, aprobado, sort, offset, limit } = queries;
        const alias = 'lote';
        let query = this.loteViewRepo.createQueryBuilder(alias);
        if(enviado != null) query = query.andWhere(`${alias}.enviado = :enviado`, { enviado });
        if(consultado != null) query = query.andWhere(`${alias}.consultado = :consultado`, { consultado });
        if(aprobado != null) query = query.andWhere(`${alias}.aprobado = :aprobado`, { aprobado });
        if(offset) query = query.skip(offset);
        if(limit) query = query.take(limit);
        if(sort){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder); 
        }
        return query;
    }

    async findAllView(queries: QueriesType): Promise<LoteView[]>{
        return this.getSelectQueryView(queries).getMany();
    }

    async countView(queries: QueriesType): Promise<number>{
        return this.getSelectQueryView(queries).getCount();
    }

    async findAllDetallesLotes(idlote: number, queries: QueriesType): Promise<LoteDetalleView[]>{
        const alias = 'detalle';
        let query = this.detalleLoteViewRepo.createQueryBuilder(alias);
        query = query.andWhere(`${alias}.idlote = :idlote`, { idlote });
        return query.getMany();
    }

    async generarLotes(): Promise<Lote[]>{
        return [...(await this.generarLotesFacturas()), ...(await this.generarLotesNotasCredito())];
    }

    private async generarLotesFacturas(): Promise<Lote[]>{

        const alias = 'dte';
        const lotes: Lote[] = [];

        const queryFacturas = this.dteRepo.createQueryBuilder(alias)
        .leftJoin(Venta, 'venta', `venta.iddte = ${alias}.id`)
        .leftJoinAndSelect(`${alias}.detallesLote`, 'detallesLote')
        .leftJoinAndSelect('detallesLote.lote', 'lote')
        .where(`${alias}.idestadoDocumentoSifen = :idestado`, {idestado: EstadoDocumentoSifen.NO_ENVIADO})
        .andWhere(`${alias}.tipoDocumento = 'FAC'`)
        .andWhere(`${alias}.firmado = TRUE`)
        .andWhere(`venta.eliminado = FALSE`)
        .andWhere(`venta.anulado = FALSE`)
        .orderBy(`${alias}.id`, 'ASC');

        let facturasElec = (await queryFacturas.getMany())
            .filter(f => !f.detallesLote.some(d => !d.lote.enviado));

        await this.datasource.transaction(async manager => {
            while(facturasElec.length > 0){
                const lote = await manager.save(new Lote());                
                lote.detallesLote = [];
                facturasElec.slice(0, this.TAMANIO_LOTE).forEach(async factElec => {
                    const detalleLote = new DetalleLote();
                    detalleLote.idlote = lote.id;
                    detalleLote.iddte = factElec.id;
                    lote.detallesLote = lote.detallesLote.concat([detalleLote]);
                    await manager.save(detalleLote);
                })
                await manager.save(Lote.getEventoAuditoria(
                    Usuario.ID_USUARIO_SISTEMA, 'R', null, lote
                ));
                facturasElec = facturasElec.slice(this.TAMANIO_LOTE);
                lotes.push(lote);
            }
        });
        return lotes;
    }

    private async generarLotesNotasCredito(): Promise<Lote[]>{

        const alias = 'dte';
        const lotes: Lote[] = [];

        const queryNotas = this.dteRepo.createQueryBuilder(alias)
        .leftJoin(NotaCredito, 'nota', `nota.iddte = ${alias}.id`)
        .leftJoinAndSelect(`${alias}.detallesLote`, 'detallesLote')
        .leftJoinAndSelect('detallesLote.lote', 'lote')
        .where(`${alias}.idestadoDocumentoSifen = :idestado`, {idestado: EstadoDocumentoSifen.NO_ENVIADO})
        .andWhere(`${alias}.tipoDocumento = 'NCR'`)
        .andWhere(`${alias}.firmado = TRUE`)
        .andWhere(`nota.eliminado = FALSE`)
        .andWhere(`nota.anulado = FALSE`)
        .orderBy(`${alias}.id`, 'ASC');

        let notasCredElec = (await queryNotas.getMany())
            .filter(f => !f.detallesLote.some(d => !d.lote.enviado));

        await this.datasource.transaction(async manager => {
            while(notasCredElec.length > 0){
                const lote = await manager.save(new Lote());                
                lote.detallesLote = [];
                notasCredElec.slice(0, this.TAMANIO_LOTE).forEach(async factElec => {
                    const detalleLote = new DetalleLote();
                    detalleLote.idlote = lote.id;
                    detalleLote.iddte = factElec.id;
                    lote.detallesLote = lote.detallesLote.concat([detalleLote]);
                    await manager.save(detalleLote);
                })
                await manager.save(Lote.getEventoAuditoria(
                    Usuario.ID_USUARIO_SISTEMA, 'R', null, lote
                ));
                notasCredElec = notasCredElec.slice(this.TAMANIO_LOTE);
                lotes.push(lote);
            }
        });
        return lotes;
    }

    public async actualizarDatosConsulta(respuestaLote: ResultadoProcesamientoLoteType){
        console.log('se van a actualizar los datos de facuturas segun resultado de lote');
        
        const lote = await this.lotesRepo.findOneByOrFail({id: respuestaLote.idlote})
        const oldLote = { ...lote }; 
        const detalles = await this.detalleLoteRepo.find({
            where: { idlote: lote.id },
            relations: { dte: true }
        });
        
        await this.datasource.transaction(async manager => {
            if(respuestaLote.codigo == ConsultaLoteMessageService.COD_LOTE_INEXISTENTE){
                console.log(`El lote id:${respuestaLote.idlote} no existe en SIFEN`);
                lote.fechaHoraConsulta = new Date();
                lote.consultado = false;
                lote.observacion = respuestaLote.mensaje;
                await manager.save(lote);
            }
            if(respuestaLote.codigo == ConsultaLoteMessageService.COD_LOTE_EN_PROCESO){
                console.log(`Lote id:${respuestaLote.idlote} aún en proceso`);
                lote.fechaHoraConsulta = new Date();
                lote.consultado = false;
                lote.observacion = respuestaLote.mensaje;
                await manager.save(lote);
            }

            if(
                respuestaLote.codigo != ConsultaLoteMessageService.COD_LOTE_INEXISTENTE &&
                respuestaLote.codigo != ConsultaLoteMessageService.COD_LOTE_EN_PROCESO
            ){
                for(let detalleLote of detalles){
                    const dte = detalleLote.dte;
                    const oldDte = { ... dte };
                    console.log(`Procesar DTE ${dte.id}`);

                    const resultadoProc = respuestaLote.resultados.find(r => r.cdc == this.dteXmlUtils.getCDC(dte.xml))
                    console.log('Resultado procesamiento para factura', resultadoProc);
                    if(resultadoProc == null){
                        console.log(`No se encontró el resultado de PROC id DTE:${dte.id}, lote: ${lote.id}`);
                        continue;
                    }

                    if(
                        dte.idestadoDocumentoSifen == EstadoDocumentoSifen.APROBADO ||
                        dte.idestadoDocumentoSifen == EstadoDocumentoSifen.APROBADO_CON_OBS ||
                        dte.idestadoDocumentoSifen == EstadoDocumentoSifen.CANCELADO
                    ) {
                        console.log(`DTE id ${dte.id} ya aprobado`);
                    }else {
                        if(resultadoProc.estado == 'Aprobado'){
                            dte.idestadoDocumentoSifen = EstadoDocumentoSifen.APROBADO;
                            dte.fechaCambioEstado = respuestaLote.fecha;
                        }
                        if(resultadoProc.estado == 'Aprobado con observación'){
                            dte.idestadoDocumentoSifen = EstadoDocumentoSifen.APROBADO_CON_OBS
                            dte.fechaCambioEstado = respuestaLote.fecha;
                        }
                        if(resultadoProc.estado == 'Rechazado'){
                            dte.idestadoDocumentoSifen = EstadoDocumentoSifen.RECHAZADO;
                            dte.fechaCambioEstado = respuestaLote.fecha;
                        }
                        dte.observacion = `${resultadoProc.detalle.codigo} - ${resultadoProc.detalle.mensaje}`
                        await manager.save(DTE.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldDte, dte));
                        await manager.save(dte);

                        //Actualizar estado de anulacion
                        if(
                            dte.tipoDocumento == 'NCR' &&
                            (resultadoProc.estado == 'Aprobado' ||
                            resultadoProc.estado == 'Aprobado con observación')
                        ){
                            const nota = await this.notaCreditoRepo.findOneByOrFail({iddte: dte.id})
                            const venta = await this.ventaRepo.findOneByOrFail({id: nota.idventa});
                            const oldVenta = {...venta};
                            venta.anulado = true;
                            await manager.save(venta);
                            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaVenta(Usuario.ID_USUARIO_SISTEMA, 'M', oldVenta, venta))

                            const notaDetalles = await this.notaCreditoDetalleRepo.findBy({idnotaCredito: nota.id, eliminado: false});

                            for (let detalle of notaDetalles.filter(deta => deta.idcuota != null)) {
                                const cuota = await this.cuotaRepo.findOneByOrFail({ id: detalle.idcuota });
                                const oldCuota = { ...cuota }
                                cuota.pagado = await this.pagoCuotaExists(cuota.id, venta.id);
                                await manager.save(cuota);
                                await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCuota(3, 'M', oldCuota, cuota))
                            }
                        }

                    }
                    detalleLote.codigoEstado = resultadoProc.detalle.codigo;
                    detalleLote.descripcion = resultadoProc.detalle.mensaje;
                    await manager.save(detalleLote);
                }
                lote.consultado = true;
                lote.fechaHoraConsulta = new Date();
                lote.observacion = respuestaLote.mensaje;
                await manager.save(Lote.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldLote, lote));
                await manager.save(lote);
            }
        });
    }

    private async pagoCuotaExists(idcuota: number, idventaIgnorar: number): Promise<boolean> {
        const detalleQuery = this.detalleVentaRepo.createQueryBuilder('detalle')
            .innerJoin(`detalle.cuota`, 'cuota', 'detalle.eliminado = :dveliminado', { dveliminado: false })
            .innerJoin(
                `detalle.venta`,
                'venta',
                'venta.eliminado = :veliminada AND venta.anulado = :vanulada AND venta.pagado = :vpagado AND venta.id != :idventaIgnorar',
                { veliminada: false, vanulada: false, vpagado: true, idventaIgnorar }
            )
            .where('detalle.idcuota = :idcuota', { idcuota });
        return (await detalleQuery.getCount()) != 0;
    }
}

type QueriesType = { [name: string]: any }