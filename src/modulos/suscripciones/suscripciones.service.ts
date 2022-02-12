import { Suscripcion } from '@dto/suscripcion.dto';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { IRangeQuery } from '@util/irangequery.interface';
import { WhereParam } from '@util/whereparam';

@Injectable()
export class SuscripcionesService {

    constructor(
        private dbsrv: DatabaseService
    ) { }

    async findAll(queryParams) {
        const {
            eliminado,
            idcliente,
            idgrupo,
            idservicio,
            sort,
            offset,
            limit,
            fechainiciosuscripcion,
            fechafinsuscripcion,
            estado,
            cuotaspendientesdesde,
            cuotaspendienteshasta
        } = queryParams;

        const rangeQuery: IRangeQuery = {
            joinOperator: 'AND',
            range: [
                {
                    fieldName: 'fechasuscripcion::date',
                    startValue: fechainiciosuscripcion,
                    endValue: fechafinsuscripcion
                },
                {
                    fieldName: 'cuotaspendientes',
                    startValue: cuotaspendientesdesde,
                    endValue: cuotaspendienteshasta
                }
            ]
        };

        const wp: WhereParam = new WhereParam(
            {
                eliminado, idcliente, estado
            },
            {
                idgrupo, idservicio 
            },
            rangeQuery,
            null,
            { sort, offset, limit }
        );
        var query: string = `SELECT * FROM public.vw_suscripciones ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async count(queryParams): Promise<number> {
        const {
            eliminado,
            idcliente,
            idgrupo,
            idservicio,
            fechainiciosuscripcion,
            fechafinsuscripcion,
            estado,
            cuotaspendientesdesde,
            cuotaspendienteshasta
        } = queryParams;

        const rangeQuery: IRangeQuery = {
            joinOperator: 'AND',
            range: [
                {
                    fieldName: 'fechasuscripcion::date',
                    startValue: fechainiciosuscripcion,
                    endValue: fechafinsuscripcion
                },
                {
                    fieldName: 'cuotaspendientes',
                    startValue: cuotaspendientesdesde,
                    endValue: cuotaspendienteshasta
                }
            ]
        };

        const wp: WhereParam = new WhereParam(
            {
                eliminado, idcliente, estado
            },
            {
                idgrupo, idservicio
            },
            rangeQuery,
            null,
            null
        );
        var query: string = `SELECT COUNT(*) FROM public.vw_suscripciones ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async getLastId(): Promise<number> {
        const query: string = `SELECT MAX(id) FROM public.suscripcion`;
        return (await this.dbsrv.execute(query)).rows[0].max;
    }

    async create(s: Suscripcion) {
        const query: string = `INSERT INTO public.suscripcion(id, monto, fecha_suscripcion, idcliente, iddomicilio, idservicio, estado, fecha_cambio_estado, eliminado)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, false)`;
        const params: any[] = [s.id, s.monto, s.fechasuscripcion, s.idcliente, s.iddomicilio, s.idservicio, s.estado, s.fechacambioestado];
        await this.dbsrv.execute(query, params);
    }

    async findById(id: number): Promise<Suscripcion> {
        const query: string = `SELECT * FROM public.vw_suscripciones WHERE id = $1`;
        const rows: Suscripcion[] = (await this.dbsrv.execute(query, [id])).rows;
        if (rows.length > 0) return rows[0];
        return null;
    }

    async edit(oldId: number, s: Suscripcion): Promise<boolean> {
        const query: string = `UPDATE public.suscripcion SET id = $1, monto = $2, fecha_suscripcion = $3, idcliente = $4, iddomicilio = $5, idservicio = $6, estado = $7, fecha_cambio_estado = $8 WHERE id = $9`;
        const params: any[] = [s.id, s.monto, s.fechasuscripcion, s.idcliente, s.iddomicilio, s.idservicio, s.estado, s.fechacambioestado, oldId];
        return (await this.dbsrv.execute(query, params)).rowCount > 0;
    }

    async delete(id: number): Promise<boolean> {
        const query: string = `UPDATE public.suscripcion SET eliminado = true WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rowCount > 0;
    }

    async findSuscripcionesPorCliente(idcliente: number, params): Promise<Suscripcion[]> {
        const { eliminado, sort, offset, limit } = params;
        const wp: WhereParam = new WhereParam(
            { idcliente, eliminado },
            null,
            null,
            null,
            { sort, offset, limit }
        );
        const query: string = `SELECT * FROM public.vw_suscripciones ${wp.whereStr} ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }

    async countSuscripcionesPorCliente(idcliente, params): Promise<number> {
        const { eliminado } = params;
        const wp: WhereParam = new WhereParam(
            { eliminado },
            null,
            null,
            null,
            null
        );
        const query: string = `SELECT COUNT(*) FROM public.vw_suscripciones ${wp.whereStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

}
