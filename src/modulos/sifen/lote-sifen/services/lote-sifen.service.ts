import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { Lote } from '@database/entity/facturacion/lote.entity';
import { Usuario } from '@database/entity/usuario.entity';
import { Venta } from '@database/entity/venta.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { ResultadoProcesamientoLoteType } from '../types/resultado-procesamiento-lote.type';
import { SifenUtilService } from '@modulos/ventas/service/sifen-util.service';
import { SifenLoteMessageService } from './sifen-lote-message.service';
import { LoteView } from '@database/view/facturacion/lote.view';

@Injectable()
export class LoteSifenService {

    private readonly TAMANIO_LOTE = 50;

    constructor(
        @InjectRepository(Lote)
        private lotesRepo: Repository<Lote>,
        @InjectRepository(LoteView)
        private loteViewRepo: Repository<LoteView>,
        @InjectRepository(FacturaElectronica)
        private facturaElectronicaSrv: Repository<FacturaElectronica>,
        private sifenUtilSrv: SifenUtilService,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<Lote>{
        const { enviado, consultado, aprobado, sort, offset, limit } = queries;
        const alias = 'lote';
        let query = this.lotesRepo.createQueryBuilder(alias);
        query = query.leftJoinAndSelect(`${alias}.facturas`, `factura`);
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
            relations: { facturas: true }
        });
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

    async generarLotes(): Promise<Lote[]>{
        const lotes: Lote[] = [];
        const queryFacturas = this.facturaElectronicaSrv.createQueryBuilder('factura')
        .leftJoin(Venta, 'venta', 'venta.id = factura.idventa')
        .leftJoinAndSelect('factura.lotes', 'lotes')
        .where(`factura.idestadoDocumentoSifen = :idestado`, {idestado: EstadoDocumentoSifen.NO_ENVIADO})
        .andWhere(`factura.firmado = TRUE`)
        .andWhere(`venta.eliminado = FALSE`)
        .andWhere(`venta.anulado = FALSE`)
        .orderBy(`factura.idventa`, 'ASC');

        let facturas = await queryFacturas.getMany();

        await this.datasource.transaction(async manager => {
            while(facturas.length > 0){
                const lote = await manager.save(new Lote());
                lotes.push(lote);
                facturas.slice(0, this.TAMANIO_LOTE).forEach(async factura => {
                    factura.lotes = factura.lotes.concat([lote]);
                    await manager.save(factura);
                })
                await manager.save(Lote.getEventoAuditoria(
                    Usuario.ID_USUARIO_SISTEMA, 'R', null, lote
                ));
                facturas = facturas.slice(this.TAMANIO_LOTE);
            }
        });
        return lotes;
    }

    public async actualizarDatosConsulta(respuestaLote: ResultadoProcesamientoLoteType){
        console.log('se van a actualizar los datos de facuturas segun resultado de lote');
        
        const lote = await this.findById(respuestaLote.idlote);
        await this.datasource.transaction(async manager => {
            if(respuestaLote.codigo == SifenLoteMessageService.COD_LOTE_INEXISTENTE){
                console.log(`El lote id:${respuestaLote.idlote} no existe en SIFEN`);
                lote.fechaHoraConsulta = new Date();
                lote.consultado = false;
                lote.observacion = respuestaLote.mensaje;
                await manager.save(lote);
            }
            if(respuestaLote.codigo == SifenLoteMessageService.COD_LOTE_EN_PROCESO){
                console.log(`Lote id:${respuestaLote.idlote} aún en proceso`);
                lote.fechaHoraConsulta = new Date();
                lote.consultado = false;
                lote.observacion = respuestaLote.mensaje;
                await manager.save(lote);
            }

            if(
                respuestaLote.codigo != SifenLoteMessageService.COD_LOTE_INEXISTENTE &&
                respuestaLote.codigo != SifenLoteMessageService.COD_LOTE_EN_PROCESO
            ){
                for(let factura of lote.facturas){
                    console.log(`Procesar factura electronica ${factura.idventa}`);
                    const resultadoProc = respuestaLote.resultados.find(r => r.cdc == this.sifenUtilSrv.getCDC(factura))
                    console.log('Resultado procesamiento para factura', resultadoProc);
                    if(resultadoProc == null){
                        console.log(`No se encontró el resultado de PROC  idventa:${factura.idventa}, lote: ${lote.id}`);
                        continue;
                    }
                    if(resultadoProc.estado == 'Aprobado'){
                        factura.idestadoDocumentoSifen = EstadoDocumentoSifen.APROBADO;
                        factura.fechaCambioEstado = respuestaLote.fecha;
                    }
                    if(resultadoProc.estado == 'Rechazado'){
                        factura.idestadoDocumentoSifen = EstadoDocumentoSifen.RECHAZADO;
                        factura.fechaCambioEstado = respuestaLote.fecha;
                    }
                    if(resultadoProc.estado == 'Aprobado con observación'){
                        factura.idestadoDocumentoSifen = EstadoDocumentoSifen.APROBADO_CON_OBS
                        factura.fechaCambioEstado = respuestaLote.fecha;
                    }
                    factura.observacion = `${resultadoProc.detalle.codigo} - ${resultadoProc.detalle.mensaje}`
                    await manager.save(factura);
                }
                lote.consultado = true;
                lote.fechaHoraConsulta = new Date();
                lote.observacion = respuestaLote.mensaje;
                await manager.save(lote);
            }
        });
    }
}

type QueriesType = { [name: string]: any }