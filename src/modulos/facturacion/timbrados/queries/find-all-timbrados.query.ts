import { Repository, SelectQueryBuilder } from "typeorm";
import { QueriesType } from "../types/queries-type";
import { TimbradoView } from "@database/view/facturacion/timbrado.view";

export function findAllTimbradosQuery(
    repository: Repository<TimbradoView>,
    queries: QueriesType
): SelectQueryBuilder<TimbradoView>{
    const alias = 'timbrado';
    const { sort, offset, limit, eliminado, activo } = queries;
    let query = repository.createQueryBuilder(alias);
    if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
    if(activo != null) query = query.andWhere(`${alias}.activo = :activo`, { activo });
    if(offset) query = query.skip(offset);
    if(limit) query = query.take(limit);
    if(sort){
        const sortColumn = sort.substring(1);
        const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
        query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
    }
    return query;
}