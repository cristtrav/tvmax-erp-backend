import { DatabaseService } from '@database/database.service';
import { EventoAuditoriaDTO } from '@dto/evento-auditoria.dto';
import { TablaAuditoria } from '@dto/tabla-auditoria.dto';
import { Injectable } from '@nestjs/common';
import { IRangeQuery } from '@util/irangequery.interface';
import { ISearchField } from '@util/isearchfield.interface';
import { WhereParam } from '@util/whereparam';

@Injectable()
export class AuditoriaService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAllEventos(params): Promise<EventoAuditoriaDTO[]>{
        const {offset, limit, idusuario, idtabla, fechahoradesde, fechahorahasta, operacion, search } = params;
        let sort = params.sort;
        if(sort && sort.includes('fechahora')) sort = `${sort}::timestamp`;
        const rangeQuery: IRangeQuery = {
            joinOperator: 'AND',
            range: [
                {
                    fieldName: 'fechahora::timestamp',
                    startValue: fechahoradesde,
                    endValue: fechahorahasta
                }
            ]
        }
        const searchQuery: ISearchField[] = [
            {
                exactMatch: true,
                fieldName: 'id',
                fieldValue: search
            },
            {
                exactMatch: false,
                fieldName: 'nombresusuario',
                fieldValue: search
            },
            {
                exactMatch: false,
                fieldName: 'apellidosusuario',
                fieldValue: search
            },
            {
                exactMatch: false,
                fieldName: 'tabla',
                fieldValue: search
            }
        ];
        const wp: WhereParam = new WhereParam(
            { idusuario, idtabla, operacion },
            null,
            rangeQuery,
            searchQuery,
            { sort, offset, limit }
        );
        const query: string = `SELECT * FROM public.vw_eventos_auditoria ${wp.whereStr} ${wp.sortOffsetLimitStr}`;        
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async countEventos(params): Promise<number>{
        const { idusuario, idtabla, fechahoradesde, fechahorahasta, operacion, search } = params;
        const rangeQuery: IRangeQuery = {
            joinOperator: 'AND',
            range: [
                {
                    fieldName: 'fechahora::timestamp',
                    startValue: fechahoradesde,
                    endValue: fechahorahasta
                }
            ]
        }
        const searchQuery: ISearchField[] = [
            {
                exactMatch: true,
                fieldName: 'id',
                fieldValue: search
            },
            {
                exactMatch: false,
                fieldName: 'nombresusuario',
                fieldValue: search
            },
            {
                exactMatch: false,
                fieldName: 'apellidosusuario',
                fieldValue: search
            },
            {
                exactMatch: false,
                fieldName: 'tabla',
                fieldValue: search
            }
        ];
        const wp: WhereParam = new WhereParam(
            {idusuario, idtabla, operacion},
            null,
            rangeQuery,
            searchQuery,
            null
        );
        const query: string = `SELECT COUNT(*) FROM public.vw_eventos_auditoria ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async findAllTablas(params): Promise<TablaAuditoria[]> {
        const {sort, offset, limit} = params;
        const wp: WhereParam = new WhereParam(
            null,
            null,
            null,
            null,
            {sort, offset, limit}
        );
        const query: string = `SELECT * FROM public.tabla_auditoria ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async countTablas(params): Promise<number>{
        const wp: WhereParam = new WhereParam(
            null,
            null,
            null,
            null,
            null
        );
        const query: string = `SELECT COUNT(*) FROM public.tabla_auditoria ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }
}
