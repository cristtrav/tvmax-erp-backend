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

@Injectable()
export class LoteSifenService {

    private readonly TAMANIO_LOTE = 50;

    constructor(
        @InjectRepository(Lote)
        private lotesSrv: Repository<Lote>,
        @InjectRepository(FacturaElectronica)
        private facturaElectronicaSrv: Repository<FacturaElectronica>,
        private sifenUtilSrv: SifenUtilService,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<Lote>{
        const { enviado, consultado, aprobado, sort } = queries;
        const alias = 'lote';
        let query = this.lotesSrv.createQueryBuilder(alias);
        query = query.leftJoinAndSelect(`${alias}.facturas`, `factura`);
        if(enviado != null) query = query.andWhere(`${alias}.enviado = :enviado`, { enviado });
        if(consultado != null) query = query.andWhere(`${alias}.consultado = :consultado`, { consultado });
        if(aprobado != null) query = query.andWhere(`${alias}.aprobado = :aprobado`, { aprobado });
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
        return await this.lotesSrv.findOneOrFail({
            where: { id },
            relations: { facturas: true }
        });
    }

    async generarLotes(): Promise<Lote[]>{
        const lotes: Lote[] = [];
        const queryFacturas = this.facturaElectronicaSrv.createQueryBuilder('factura')
        .leftJoinAndSelect(`factura.lotes`, `lote`)
        .leftJoin(Venta, 'venta', 'venta.id = factura.idventa')
        .where(`factura.idestadoDocumentoSifen = :idestado`, {idestado: EstadoDocumentoSifen.NO_ENVIADO})
        .andWhere(`factura.firmado = TRUE`)
        .andWhere(`venta.eliminado = FALSE`)
        .andWhere(`venta.anulado = FALSE`)
        .orderBy(`factura.idventa`, 'ASC');

        let facturas = (await queryFacturas.getMany()).filter(f => f.lotes.length == 0);

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
                return;
            }
            if(respuestaLote.codigo == SifenLoteMessageService.COD_LOTE_EN_PROCESO){
                console.log(`Lote id:${respuestaLote.idlote} aún en proceso`);
                lote.fechaHoraConsulta = new Date();
                lote.consultado = false;
                lote.observacion = respuestaLote.mensaje;
                await manager.save(lote);
                return;
            }

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
                    factura.fechaCambioEstado = new Date();
                }
                if(resultadoProc.estado == 'Rechazado'){
                    factura.idestadoDocumentoSifen = EstadoDocumentoSifen.RECHAZADO;
                    factura.fechaCambioEstado = new Date();
                }
                if(resultadoProc.estado == 'Aprobado con observación'){
                    factura.idestadoDocumentoSifen = EstadoDocumentoSifen.APROBADO_CON_OBS
                    factura.fechaCambioEstado = new Date();
                }
                factura.observacion = `${resultadoProc.detalle.codigo} - ${resultadoProc.detalle.mensaje}`
                await manager.save(factura);
            }
            lote.consultado = true;
            lote.fechaHoraConsulta = new Date();
            lote.observacion = respuestaLote.mensaje;
            await manager.save(lote);
        });
    }
}

type QueriesType = { [name: string]: any }