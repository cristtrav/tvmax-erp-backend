import { NotaCreditoView } from '@database/view/facturacion/nota-credito.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueriesType } from '../types/queries-type';
import { findAllNotasCreditoQuery } from '../queries/find-all-notas-credito.query';

@Injectable()
export class CountNotasCreditoService {

    constructor(
        @InjectRepository(NotaCreditoView)
        private notasCreditoViewRepo: Repository<NotaCreditoView>
    ){}

    count(queries: QueriesType): Promise<number>{
        return findAllNotasCreditoQuery(this.notasCreditoViewRepo, queries).getCount();
    }

}
