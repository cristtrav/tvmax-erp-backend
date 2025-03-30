import { AjusteMaterialIdentificable } from '@database/entity/depositos/ajuste-material-identificable.entity';
import { AjusteExistenciaView } from '@database/view/depositos/ajuste-existencia.view';
import { AjusteMaterialIdentificableView } from '@database/view/depositos/ajuste-material-identificable.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class ConsultarAjustesService {

    constructor(
        @InjectRepository(AjusteExistenciaView)
        private ajusteExistenciaViewRepo: Repository<AjusteExistenciaView>,
        @InjectRepository(AjusteMaterialIdentificableView)
        private ajusteIdentificableViewRepo: Repository<AjusteMaterialIdentificableView>
    ){}

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<AjusteExistenciaView>{
        const alias = 'ajuste';
        const { sort, offset, limit, idmaterial, eliminado } = queries;
        let query = this.ajusteExistenciaViewRepo.createQueryBuilder(alias);
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if(idmaterial != null) query = query.andWhere(`${alias}.idmaterial = :idmaterial`, { idmaterial });
        if(offset != null) query = query.skip(offset);
        if(limit != null) query = query.take(limit);
        if(sort != null){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    private getSelectQueryAjusteIdentificable(queries: QueriesType): SelectQueryBuilder<AjusteMaterialIdentificableView>{
        const { idajuste, idmaterial } = queries;
        const alias = 'ajuste';
        let query = this.ajusteIdentificableViewRepo.createQueryBuilder(alias);
        if(idajuste != null) query = query.andWhere(`${alias}.idajuste = :idajuste`, {idajuste});
        if(idmaterial != null) query = query.andWhere(`${alias}.idmaterial = :idmaterial`, {idmaterial});
        return query;
    }

    findAll(queries: QueriesType): Promise<AjusteExistenciaView[]>{
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: QueriesType): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    findById(id: number): Promise<AjusteExistenciaView>{
        return this.ajusteExistenciaViewRepo.findOneByOrFail({ id });
    }

    findAllAjustesIdentificables(queries: QueriesType): Promise<AjusteMaterialIdentificableView[]>{
        return this.getSelectQueryAjusteIdentificable(queries).getMany();
    }

}

type QueriesType = {[name: string]: any}
