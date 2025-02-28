import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { VentaView } from '@database/view/venta.view';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { SifenApiUtilService } from '../../sifen/sifen-utils/services/sifen/sifen-api-util.service';
import { Usuario } from '@database/entity/usuario.entity';
import { ConsultaDTEMessageService } from '@modulos/sifen/sifen-utils/services/consultas/consulta-dte-message.service';

const appendIdOnSort: string[] = [
    "fechafactura",
    "fechacobro",
    "ci",
    "cliente",
    "total"
]

@Injectable()
export class VentasService {

    constructor(
        @InjectRepository(VentaView)
        private ventaViewRepo: Repository<VentaView>,
        @InjectRepository(DTE)
        private facturaElectronicaRepo: Repository<DTE>,
        private datasource: DataSource,
        private sifenApiUtilSrv: SifenApiUtilService
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<VentaView> {
        const {
            eliminado,
            search,
            fechainiciofactura,
            fechafinfactura,
            pagado,
            anulado,
            idcobradorcomision,
            idusuarioregistrocobro,
            fechainiciocobro,
            fechafincobro,
            sort,
            offset,
            limit,
            idtalonario,
            nrofactura,
            idestadodte
        } = queries;

        const alias: string = 'venta';
        let query: SelectQueryBuilder<VentaView> = this.ventaViewRepo.createQueryBuilder(alias);

        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (pagado != null) query = query.andWhere(`${alias}.pagado = :pagado`, { pagado });
        if (anulado != null) query = query.andWhere(`${alias}.anulado = :anulado`, { anulado });
        if (fechainiciofactura) query = query.andWhere(`${alias}.fechafactura >= :fechainiciofactura`, { fechainiciofactura });
        if (fechafinfactura) query = query.andWhere(`${alias}.fechafactura <= :fechafinfactura`, { fechafinfactura });
        if (fechainiciocobro) query = query.andWhere(`${alias}.fechacobro >= :fechainiciocobro`, { fechainiciocobro });
        if (fechafincobro) query = query.andWhere(`${alias}.fechacobro <= :fechafincobro`, { fechafincobro });
        if (nrofactura) query = query.andWhere(`${alias}.nrofactura = :nrofactura`, { nrofactura });
        if (idtalonario) query = query.andWhere(`${alias}.idtalonario = :idtalonario`, { idtalonario });
        if (idestadodte) query = query.andWhere(`${alias}.idestadodte = :idestadodte`, { idestadodte });
        if (idcobradorcomision)
            if (Array.isArray(idcobradorcomision)) query = query.andWhere(`${alias}.idcobradorcomision IN (:...idcobradorcomision)`, { idcobradorcomision });
            else query = query.andWhere(`${alias}.idcobradorcomision = :idcobradorcomision`, { idcobradorcomision });
        if (idusuarioregistrocobro)
            if (Array.isArray(idusuarioregistrocobro)) query = query.andWhere(`${alias}.idusuarioregistrocobro IN (:...idusuarioregistrocobro)`, { idusuarioregistrocobro });
            else query = query.andWhere(`${alias}.idusuarioregistrocobro = :idusuarioregistrocobro`, { idusuarioregistrocobro });
        if (search) {
            query = query.andWhere(new Brackets(qb => {
                qb = qb.orWhere(`LOWER(${alias}.cliente) LIKE :searchcli`, { searchcli: `%${search.toLowerCase()}%` });
                if (Number.isInteger(Number(search))) qb = qb.orWhere(`${alias}.nrofactura = :searchnrofact`, { searchnrofact: search });
            }));
        }
        
        if (limit) query = query.take(limit);
        if (offset) query = query.skip(offset);

        if (sort) {
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            if(sortColumn === 'nrofactura'){
                query = query.orderBy(`${alias}.prefijofactura`, sortOrder);
                query = query.addOrderBy(`${alias}.nrofactura`, sortOrder);
            }else query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
            if(appendIdOnSort.includes(sortColumn)) query = query.addOrderBy(`${alias}.id`, sortOrder);
        }
        return query;
    }

    findAll(queries: { [name: string]: any }): Promise<VentaView[]> {
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: { [name: string]: any }): Promise<number> {
        return this.getSelectQuery(queries).getCount();
    }

    async findById(id: number): Promise<VentaView> {
        return this.ventaViewRepo.findOneByOrFail({ id });
    }

    public async consultarFacturaSifen(id: number){
        const facturaElectronica = await this.facturaElectronicaRepo.findOneByOrFail({ id });
        const oldFacturaElectronica = {... facturaElectronica };

        if(facturaElectronica.idestadoDocumentoSifen == EstadoDocumentoSifen.CANCELADO)
            throw new HttpException({
                message: 'Factura anulada (cancelada).'
            }, HttpStatus.BAD_REQUEST)

        if(facturaElectronica.idestadoDocumentoSifen == EstadoDocumentoSifen.NO_ENVIADO)
            throw new HttpException({
                message: 'Factura pendiente de envío a SIFEN'
            }, HttpStatus.BAD_REQUEST)

        const respuesta = await this.sifenApiUtilSrv.consultarDTE(facturaElectronica);
        await this.datasource.transaction(async manager => {
            facturaElectronica.fechaCambioEstado = new Date(respuesta.fecha);
            facturaElectronica.observacion = respuesta.mensaje;
            if(respuesta.codigo == ConsultaDTEMessageService.COD_ENCONTRADO)
                facturaElectronica.idestadoDocumentoSifen = EstadoDocumentoSifen.APROBADO;
            else if(respuesta.codigo == ConsultaDTEMessageService.COD_NO_ENCONTRADO){
                facturaElectronica.idestadoDocumentoSifen = EstadoDocumentoSifen.RECHAZADO;
            }else{
                console.log(`idventa: ${id}, ${respuesta.codigo} - ${respuesta.mensaje}`);
            }
            await manager.save(DTE.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldFacturaElectronica, facturaElectronica));
            await manager.save(facturaElectronica);
        })
    }
}
