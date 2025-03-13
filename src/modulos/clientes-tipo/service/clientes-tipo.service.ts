import { ClienteTipo } from '@database/entity/cliente-tipo.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class ClientesTipoService {

    constructor(
        @InjectRepository(ClienteTipo)
        private clienteTipoRepo: Repository<ClienteTipo>,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<ClienteTipo>{
        const alias = 'tipo';
        const { sort, offset, limit } = queries;
        let query = this.clienteTipoRepo.createQueryBuilder(alias);
        if(limit != null) query = query.take(limit);
        if(offset != null) query = query.skip(offset);
        if(sort != null){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    findAll(queries: QueriesType): Promise<ClienteTipo[]>{
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: QueriesType): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

}

type QueriesType = { [name: string]: any }
