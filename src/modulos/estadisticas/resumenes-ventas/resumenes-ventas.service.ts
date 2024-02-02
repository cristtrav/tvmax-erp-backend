import { DetalleVentaView } from '@database/view/detalle-venta.view';
import { VentaView } from '@database/view/venta.view';
import { ResumenCobradoresVentasDTO } from 'src/global/dto/resumen-cobradores-ventas.dto';
import { ResumenGruposVentasDTO } from 'src/global/dto/resumen-grupos-ventas.dto';
import { ResumenServiciosVentasDTO } from 'src/global/dto/resumen-servicios-ventas.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class ResumenesVentasService {

    constructor(
        @InjectRepository(VentaView)
        private ventaViewRepo: Repository<VentaView>,
        @InjectRepository(DetalleVentaView)
        private dealleVentaViewRepo: Repository<DetalleVentaView>
    ) { }

    private addWhereParamsToQuery(
        alias: string,
        queryBuilder: SelectQueryBuilder<VentaView>,
        queries: { [name: string]: any }
    ): SelectQueryBuilder<VentaView> {
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
            fechafincobro
        } = queries;
        if (eliminado != null) queryBuilder = queryBuilder.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (pagado != null) queryBuilder = queryBuilder.andWhere(`${alias}.pagado = :pagado`, { pagado });
        if (anulado != null) queryBuilder = queryBuilder.andWhere(`${alias}.anulado = :anulado`, { anulado });
        if (idcobradorcomision)
            if (Array.isArray(idcobradorcomision)) queryBuilder = queryBuilder.andWhere(`${alias}.idcobradorcomision IN (:...idcobradorcomision)`, { idcobradorcomision });
            else queryBuilder = queryBuilder.andWhere(`${alias}.idcobradorcomision = :idcobradorcomision`, { idcobradorcomision });
        if (idusuarioregistrocobro)
            if (Array.isArray(idusuarioregistrocobro)) queryBuilder = queryBuilder.andWhere(`${alias}.idusuarioregistrocobro IN (:...idusuarioregistrocobro)`, { idusuarioregistrocobro });
            else queryBuilder = queryBuilder.andWhere(`${alias}.idusuarioregistrocobro = :idusuarioregistrocobro`, { idusuarioregistrocobro });
        if (fechainiciofactura) queryBuilder = queryBuilder.andWhere(`${alias}.fechafactura >= :fechainiciofactura`, { fechainiciofactura });
        if (fechafinfactura) queryBuilder = queryBuilder.andWhere(`${alias}.fechafactura <= :fechafinfactura`, { fechafinfactura });
        if (fechainiciocobro) queryBuilder = queryBuilder.andWhere(`${alias}.fechacobro >= :fechainiciocobro`, { fechainiciocobro });
        if (fechafincobro) queryBuilder = queryBuilder.andWhere(`${alias}.fechacobro <= :fechafincobro`, { fechafincobro });
        if (search) {
            queryBuilder = queryBuilder.andWhere(new Brackets(qb => {
                qb = qb.orWhere(`LOWER(${alias}.cliente) LIKE :clisearch`, { clisearch: `%${search.toLowerCase()}%` });
                qb = qb.orWhere(`${alias}.nrofactura = :nrofacturasearch`, { nrofacturasearch: search });
            }));
        }
        return queryBuilder;
    }

    private getSelectQueryTotal(queries: { [name: string]: any }): SelectQueryBuilder<VentaView | DetalleVentaView> {
        const alias = 'venta';
        let query = this.ventaViewRepo.createQueryBuilder(alias)
            .select(`SUM(${alias}.total)`, 'total')
        return this.addWhereParamsToQuery(alias, query, queries)
    }

    async getMonto(queries: { [name: string]: any }): Promise<number> {
        return (await this.getSelectQueryTotal(queries).getRawOne()).total ?? 0;
    }

    private getGruposSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<DetalleVentaView> {
        const { sort, offset, limit } = queries;
        const aliasVenta = 'venta';
        let queryVenta = this.addWhereParamsToQuery(aliasVenta, this.ventaViewRepo.createQueryBuilder(aliasVenta), queries)

        const aliasDetalle = 'detalleventa';
        let queryDetalle = this.dealleVentaViewRepo.createQueryBuilder(aliasDetalle)
            .select(`${aliasDetalle}.idgrupo`, 'idgrupo')
            .addSelect(`${aliasDetalle}.grupo`, 'grupo')
            .addSelect(`SUM(${aliasDetalle}.subtotal)`, 'monto')
            .where(`${aliasDetalle}.eliminado = :dveliminado`, { dveliminado: false })
            .innerJoin(`(${queryVenta.getQuery()})`, aliasVenta, `${aliasDetalle}.idventa = ${aliasVenta}_id`)
            .addGroupBy(`${aliasDetalle}.idgrupo`)
            .addGroupBy(`${aliasDetalle}.grupo`)
            .setParameters(queryVenta.getParameters());
        if (offset) queryDetalle = queryDetalle.offset(offset);
        if (limit) queryDetalle = queryDetalle.limit(limit)
        if (sort) {
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            queryDetalle = queryDetalle.orderBy(sortColumn, sortOrder);
        }
        return queryDetalle;
    }

    private getServiciosSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<DetalleVentaView> {
        const { sort, offset, limit } = queries;

        const aliasVenta = 'venta';
        let queryVenta = this.addWhereParamsToQuery(aliasVenta, this.ventaViewRepo.createQueryBuilder(aliasVenta), queries);

        const aliasDetalle = 'detalleventa';
        let queryDetalle = this.dealleVentaViewRepo.createQueryBuilder(aliasDetalle)
            .select(`${aliasDetalle}.idservicio`, 'idservicio')
            .addSelect(`${aliasDetalle}.servicio`, 'servicio')
            .addSelect(`${aliasDetalle}.idgrupo`, 'idgrupo')
            .addSelect(`${aliasDetalle}.grupo`, 'grupo')
            .addSelect(`SUM(${aliasDetalle}.subtotal)`, 'monto')
            .where(`${aliasDetalle}.eliminado = :dveliminado`, { dveliminado: false })
            .innerJoin(`(${queryVenta.getQuery()})`, aliasVenta, `${aliasDetalle}.idventa = ${aliasVenta}_id`)
            .addGroupBy(`${aliasDetalle}.idservicio`)
            .addGroupBy(`${aliasDetalle}.servicio`)
            .addGroupBy(`${aliasDetalle}.idgrupo`)
            .addGroupBy(`${aliasDetalle}.grupo`)
            .setParameters(queryVenta.getParameters())
        if (offset) queryDetalle = queryDetalle.offset(offset);
        if (limit) queryDetalle = queryDetalle.limit(limit);
        if (sort) {
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            queryDetalle = queryDetalle.orderBy(sortColumn, sortOrder);
        }
        return queryDetalle;
    }

    private getCobradoresSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<VentaView> {
        const alias = 'venta';
        const { sort, offset, limit } = queries;
        let query = this.ventaViewRepo.createQueryBuilder(alias)
            .select(`${alias}.idcobradorcomision`, 'idcobrador')
            .addSelect(`${alias}.cobrador`, 'cobrador')
            .addSelect(`SUM(${alias}.total)`, 'monto')
            .addGroupBy(`${alias}.idcobradorcomision`)
            .addGroupBy(`${alias}.cobrador`);
        if (offset) query = query.offset(offset);
        if (limit) query = query.limit(limit);
        if(sort){
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(sortColumn, sortOrder);
        }
        return this.addWhereParamsToQuery(alias, query, queries);
    }

    findAllResumenGruposVentas(queries: { [name: string]: any }): Promise<ResumenGruposVentasDTO[]> {
        return this.getGruposSelectQuery(queries).getRawMany();
    }

    async countResumenGruposVentas(queries: { [name: string]: any }): Promise<number> {
        return (await this.getGruposSelectQuery(queries).offset(0).limit(0).getRawMany()).length;
    }

    findAllResumenServiciosVentas(queries: { [name: string]: any }): Promise<ResumenServiciosVentasDTO[]> {
        return this.getServiciosSelectQuery(queries).getRawMany();
    }

    async countResumenServiciosVentas(queries: { [name: string]: any }): Promise<number> {
        return (await this.getServiciosSelectQuery(queries).offset(0).limit(0).getRawMany()).length;
    }

    findAllResumenCobradores(queries: {[name: string]: any}): Promise<ResumenCobradoresVentasDTO[]>{
        return this.getCobradoresSelectQuery(queries).getRawMany();
    }

    async countResumenCobradores(queries: {[name: string]: any}): Promise<number>{
        return (await this.getCobradoresSelectQuery(queries).offset(0).limit(0).getRawMany()).length;
    }

}
