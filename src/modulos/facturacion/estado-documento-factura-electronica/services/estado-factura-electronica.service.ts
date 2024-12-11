import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class EstadoFacturaElectronicaService {

    constructor(
        @InjectRepository(EstadoDocumentoSifen)
        private estadoDocumentoSifenRepo: Repository<EstadoDocumentoSifen>
    ){}

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<EstadoDocumentoSifen>{
        const { sort, offset, limit } = queries;
        const alias = 'estado';
        let query = this.estadoDocumentoSifenRepo.createQueryBuilder(alias);
        if(limit) query = query.take(limit);
        if(offset) query = query.skip(offset);
        if(sort){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    async findAll(queries: QueriesType): Promise<EstadoDocumentoSifen[]>{
        return this.getSelectQuery(queries).getMany();
    }

    async count(queries: QueriesType): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

}

type QueriesType = { [name:string]: any }
