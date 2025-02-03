import { Timbrado } from '@database/entity/facturacion/timbrado.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueriesType } from '../types/queries-type';
import { findAllTimbradosQuery } from '../queries/find-all-timbrados.query';
import { TimbradoView } from '@database/view/facturacion/timbrado.view';

@Injectable()
export class FindAllTimbradosService {

    constructor(
        @InjectRepository(TimbradoView)
        private timbradosRepo: Repository<TimbradoView>
    ){}

    public async findAll(queries: QueriesType): Promise<TimbradoView[]>{
        return findAllTimbradosQuery(this.timbradosRepo, queries).getMany();
    }

}
