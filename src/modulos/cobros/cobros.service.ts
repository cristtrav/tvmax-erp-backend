import { CobroDetalleVentaView } from '@database/view/cobro-detalle-venta.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class CobrosService {

    constructor(
        @InjectRepository(CobroDetalleVentaView)
        private cobroDetalleVentaViewRepo: Repository<CobroDetalleVentaView>,
        private datasource: DataSource
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<CobroDetalleVentaView> {
        const {
            eliminado,
            pagado,
            anulado,
            fechainiciofactura,
            fechafinfactura,
            fechainiciocobro,
            fechafincobro,
            idusuarioregistrocobro,
            idcobradorcomision,
            idgrupo,
            idservicio,
            search,
            sort,
            offset,
            limit
        } = queries;

        const alias = 'cobro';
        let query = this.cobroDetalleVentaViewRepo.createQueryBuilder(alias);
        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (fechainiciofactura) query = query.andWhere(`${alias}.fechafactura >= :fechainiciofactura`, { fechainiciofactura });
        if (fechafinfactura) query = query.andWhere(`${alias}.fechafactura <= :fechafinfactura`, { fechafinfactura });
        if (fechainiciocobro) query = query.andWhere(`${alias}.fechacobro >= :fechainiciocobro`, { fechainiciocobro });
        if (fechafincobro) query = query.andWhere(`${alias}.fechacobro <= :fechafincobro`, { fechafincobro });
        if (pagado) query = query.andWhere(`${alias}.pagado = :pagado`, { pagado });
        if (anulado) query = query.andWhere(`${alias}.anulado = :anulado`, { anulado });
        if (idusuarioregistrocobro)
            if (Array.isArray(idusuarioregistrocobro)) query = query.andWhere(`${alias}.idusuarioregistrocobro IN (:...idusuarioregistrocobro)`, { idusuarioregistrocobro });
            else query = query.andWhere(`${alias}.idusuarioregistrocobro = :idusuarioregistrocobro`, { idusuarioregistrocobro });
        if (idcobradorcomision)
            if (Array.isArray(idcobradorcomision)) query = query.andWhere(`${alias}.idcobrador IN (:...idcobradorcomision)`, { idcobradorcomision });
            else query = query.andWhere(`${alias}.idcobradorcomision = :idcobradorcomision`, { idcobradorcomision });
        if (idgrupo || idservicio) {
            query = query.andWhere(new Brackets(qb => {
                if (idgrupo)
                    if (Array.isArray(idgrupo)) qb = qb.orWhere(`${alias}.idgrupo IN (:...idgrupo)`, { idgrupo });
                    else qb = qb.orWhere(`${alias}.idgrupo = :idgrupo`, { idgrupo });
                if (idservicio)
                    if (Array.isArray(idservicio)) qb = qb.orWhere(`${alias}.idservicio IN (:...idservicio)`, { idservicio });
                    else qb.orWhere(`${alias}.idservicio = :idservicio`, { idservicio });
            }));
        }
        if (search) query = query.andWhere(new Brackets(qb => {
            qb = qb.orWhere(`LOWER(${alias}.cliente) LIKE :searchcli`, { searchcli: `%${search.toLowerCase()}%` });
            qb = qb.orWhere(`${alias}.facturacobro LIKE :searchfactura`, { searchfactura: search })
            qb = qb.orWhere(`${alias}.ci = :searchci`, {searchci: search});
            qb = qb.orWhere(`LOWER(${alias}.servicio) LIKE :searchservicio`, {searchservicio: `%${search.toLowerCase()}%`});
            qb = qb.orWhere(`LOWER(${alias}.grupo) LIKE :searchgrupo`, {searchgrupo: `%${search.toLowerCase()}%`});
            qb = qb.orWhere(`LOWER(${alias}.cobrador) LIKE :searchcobrador`, { searchcobrador: `%${search.toLowerCase()}%`});
            qb = qb.orWhere(`LOWER(${alias}.usuario) LIKE :searchusuario`, { searchusuario: `%${search.toLowerCase()}%`});
        }));
        if(limit) query = query.take(limit);
        if(offset) query = query.skip(offset);
        if(sort){
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(sortColumn, sortOrder);
        }
        return query;
    }

    findAllDetalles(queries: {[name: string]: any}): Promise<CobroDetalleVentaView[]>{
        return this.getSelectQuery(queries).getMany();
    }

    countDetalles(queries: {[name: string]: any}): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    } 

}
