import { NotaCreditoView } from "@database/view/facturacion/nota-credito.view";
import { Repository, SelectQueryBuilder } from "typeorm";
import { QueriesType } from "../types/queries-type";

export function findAllNotasCreditoQuery(
    repository: Repository<NotaCreditoView>,
    queries: QueriesType
): SelectQueryBuilder<NotaCreditoView>{
    const { eliminado, sort, offset, limit } = queries;
    const alias = 'nota';
    let query = repository.createQueryBuilder(alias);
    if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, {eliminado});
    if(limit) query = query.take(limit);
    if(offset) query = query.skip(offset);
    if(sort){
        const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
        const sortColumn = sort.substring(1);
        if(sortColumn == 'nronota'){
            query = query.orderBy(`${alias}.prefijonota`, sortOrder);
            query = query.addOrderBy(`${alias}.nronota`, sortOrder);
        }else query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
    }
    return query;
}