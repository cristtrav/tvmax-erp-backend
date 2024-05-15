import { EventosCambiosEstadosView } from '@database/view/reclamos/eventos-cambios-estados.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

type QueriesType = {[name: string]: any}

@Injectable()
export class EventosCambiosEstadosService {

    constructor(
        @InjectRepository(EventosCambiosEstadosView)
        private eventosCambiosEstadosViewRepo: Repository<EventosCambiosEstadosView>
    ){}

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<EventosCambiosEstadosView>{
        const { idreclamo } = queries;
        const alias = 'evento';
        let query = this.eventosCambiosEstadosViewRepo.createQueryBuilder(alias);
        if(idreclamo) query = query.andWhere(`${alias}.idreclamo = :idreclamo`, { idreclamo });
        return query;
    }

    findAllEventosCambiosEstados(queries: QueriesType): Promise<EventosCambiosEstadosView[]>{
        return this.getSelectQuery(queries).getMany();
    }

    countEventosCambiosEstados(queries: QueriesType): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

}
