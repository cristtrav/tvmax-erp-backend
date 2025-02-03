import { NotaCreditoView } from '@database/view/facturacion/nota-credito.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { findAllNotasCreditoQuery } from '../queries/find-all-notas-credito.query';
import { QueriesType } from '../types/queries-type';

@Injectable()
export class FindAllNotasCreditoService {

    constructor(
        @InjectRepository(NotaCreditoView)
        private notasCreditoViewRepo: Repository<NotaCreditoView>
    ){}

    findAll(queries: QueriesType): Promise<NotaCreditoView[]>{
        return findAllNotasCreditoQuery(this.notasCreditoViewRepo, queries).getMany();
    }
}