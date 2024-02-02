import { SuscripcionView } from '@database/view/suscripcion.view';
import { ResumenBarriosSuscripcionesDTO } from 'src/global/dto/resumen-barrios-suscripciones.dto';
import { ResumenCuotasPendientesSuscripcionesDTO } from 'src/global/dto/resumen-cuotas-pendientes-suscripciones.dto';
import { ResumenDepartamentosSuscripcionesDTO } from 'src/global/dto/resumen-departamentos-suscripciones.dto';
import { ResumenDistritosSuscripcionesDTO } from 'src/global/dto/resumen-distritos-suscripciones.dto';
import { ResumenEstadosSuscripcionesDTO } from 'src/global/dto/resumen-estados-suscripciones.dto';
import { ResumenGeneralSuscripcionesDTO } from 'src/global/dto/resumen-general-suscripciones.dto';
import { ResumenGruposSuscripcionesDTO } from 'src/global/dto/resumen-grupos-suscripciones.dto';
import { ResumenServiciosSuscripcionDTO } from 'src/global/dto/resumen-servicios-suscripcion.dto';
import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class ResumenesSuscripcionesService {

    constructor(
        private datasource: DataSource
    ){}

    private addWhereParamsToQuery(
        alias: string,
        qb: SelectQueryBuilder<SuscripcionView>,
        queries: {[name: string]: any}
    ): SelectQueryBuilder<SuscripcionView>{
        const {
            eliminado,
            idcliente,
            idgrupo,
            idservicio,
            fechainiciosuscripcion,
            fechafinsuscripcion,
            estado,
            cuotaspendientesdesde,
            cuotaspendienteshasta,
            iddepartamento,
            iddistrito,
            idbarrio,
            search,
            idcobrador,
            fechainiciocambioestado,
            fechafincambioestado
        } = queries;
        let queryBuilder = qb;
        if (eliminado != null) queryBuilder = queryBuilder.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });

        if (idcliente)
            if (Array.isArray(idcliente)) queryBuilder = queryBuilder.andWhere(`${alias}.idcliente IN (:...idcliente)`, { idcliente });
            else queryBuilder = queryBuilder.andWhere(`${alias}.idcliente = :idcliente`, { idcliente });

        if (idgrupo || idservicio)
            queryBuilder = queryBuilder.andWhere(new Brackets(qb => {
                if (idgrupo)
                    if (Array.isArray(idgrupo)) qb = qb.orWhere(`${alias}.idgrupo IN (:...idgrupo)`, { idgrupo });
                    else qb = qb.andWhere(`${alias}.idgrupo = :idgrupo`, { idgrupo });
                if (idservicio)
                    if (Array.isArray(idservicio)) qb = qb.orWhere(`${alias}.idservicio IN (:...idservicio)`, { idservicio });
                    else qb = qb.orWhere(`${alias}.idservicio = :idservicio`, { idservicio });
            }));

        if (iddepartamento || iddistrito || idbarrio)
            queryBuilder = queryBuilder.andWhere(new Brackets(qb => {
                if (iddepartamento)
                    if (Array.isArray(iddepartamento)) qb = qb.orWhere(`${alias}.iddepartamento IN (:...iddepartamento)`, { iddepartamento });
                    else qb = qb.orWhere(`${alias}.iddepartamento  = :iddepartamento`, { iddepartamento });
                if (iddistrito)
                    if (Array.isArray(iddistrito)) qb = qb.orWhere(`${alias}.iddistrito IN (:...iddistrito)`, { iddistrito });
                    else qb = qb.orWhere(`${alias}.iddistrito = :iddistrito`, { iddistrito });
                if (idbarrio)
                    if (Array.isArray(idbarrio)) qb = qb.orWhere(`${alias}.idbarrio IN (:...idbarrio)`, { idbarrio });
                    else qb = qb.orWhere(`${alias}.idbarrio = :idbarrio`, { idbarrio });
            }));

        if (estado)
            if(Array.isArray(estado)) queryBuilder = queryBuilder.andWhere(`${alias}.estado IN (:...estado)`, { estado });
            else queryBuilder = queryBuilder.andWhere(`${alias}.estado = :estado`, { estado });
            
        if (fechainiciosuscripcion) queryBuilder = queryBuilder.andWhere(`${alias}.fechasuscripcion >= :fechainiciosuscripcion`, { fechainiciosuscripcion: new Date(fechainiciosuscripcion) });
        if (fechafinsuscripcion) queryBuilder = queryBuilder.andWhere(`${alias}.fechasuscripcion <= (:fechafinsuscripcion)::date`, { fechafinsuscripcion: new Date(fechafinsuscripcion) });
        if (cuotaspendientesdesde) queryBuilder = queryBuilder.andWhere(`${alias}.cuotaspendientes >= :cuotaspendientesdesde`, { cuotaspendientesdesde });
        if (cuotaspendienteshasta) queryBuilder = queryBuilder.andWhere(`${alias}.cuotaspendientes <= :cuotaspendienteshasta`, { cuotaspendienteshasta });
        if (idcobrador) queryBuilder = queryBuilder.andWhere(`${alias}.idcobrador = :idcobrador`, { idcobrador }) ;
        if (fechainiciocambioestado) queryBuilder = queryBuilder.andWhere(`${alias}.fechacambioestado >= :fechainiciocambioestado`, { fechainiciocambioestado: new Date(fechainiciocambioestado) });
        if (fechafincambioestado) queryBuilder = queryBuilder.andWhere(`${alias}.fechacambioestado <= :fechafincambioestado`, { fechafincambioestado: new Date(fechafincambioestado) });
        if (search){
            queryBuilder = queryBuilder.andWhere(new Brackets(qb => {
                if(Number.isInteger(Number(search))) qb = qb.orWhere(`${alias}.id = :idsearch`, {idsearch: search});
                qb = qb.orWhere(`LOWER(${alias}.cliente) LIKE :clisearch`, { clisearch: `%${search.toLowerCase()}%`});
            }));
        }
        return qb;
    }

    private addSortOffsetLimitToQuery(
        alias: string,
        qb: SelectQueryBuilder<SuscripcionView>,
        queries: {[name: string]: any}
    ): SelectQueryBuilder<any>{
        const { sort, offset, limit } = queries;
        let queryBuilder = qb;
        if(offset) queryBuilder = queryBuilder.offset(offset);
        if(limit) queryBuilder = queryBuilder.limit(limit);
        if(sort) {
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            queryBuilder = queryBuilder.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return qb;
    }

    private getCuotasPendientesSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<any> {
        const alias = 'resumen';
        let query: SelectQueryBuilder<any> = this.datasource.manager.createQueryBuilder()
        .select(`${alias}.cuotaspendientes`, 'nrocuotas')
        .addSelect(`COUNT(*)`, 'cantidad')
        .addSelect(`SUM(${alias}.deuda)`, 'monto')
        .from((subquery) => {
            const subq = subquery
            .select('s.cuotaspendientes', 'cuotaspendientes')
            .addSelect('s.deuda', 'deuda')
            .from(SuscripcionView, 's')
            .orderBy('s.id', 'DESC');
            return this.addWhereParamsToQuery('s', subq, queries)
        }, alias)
        .addGroupBy(`${alias}.cuotaspendientes`);
        return this.addSortOffsetLimitToQuery(alias, query, queries);
    }

    private getGruposSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<any>{
        const alias = 'resumen';
        let query: SelectQueryBuilder<any> = this.datasource.manager.createQueryBuilder()
        .select(`${alias}.idgrupo`, 'idgrupo')
        .addSelect(`${alias}.grupo`, 'grupo')
        .addSelect(`COUNT(*)`, 'cantidad')
        .addSelect(`SUM(${alias}.deuda)`, 'monto')
        .from((subquery) => {
            const subq = subquery
            .select('s.idgrupo', 'idgrupo')
            .addSelect('s.grupo', 'grupo')
            .addSelect('s.deuda', 'deuda')
            .from(SuscripcionView, 's')
            .orderBy('s.id', 'DESC');
            return this.addWhereParamsToQuery('s', subq, queries);
        }, alias)
        .groupBy(`${alias}.idgrupo`)
        .addGroupBy(`${alias}.grupo`);
        if(queries.limit) query = query.limit(queries.limit);
        if(queries.offset) query = query.offset(queries.offset);
        if(queries.sort){
            const sortOrder: 'ASC' | 'DESC' = queries.sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = queries.sort.substring(1);
            if(sortColumn == 'cantidad') query = query.orderBy(`${sortColumn}`, sortOrder);
            else query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    private getServiciosSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<any>{
        const alias = 'resumen';
        let query: SelectQueryBuilder<any> = this.datasource.manager.createQueryBuilder()
        .select(`${alias}.idservicio`, 'idservicio')
        .addSelect(`${alias}.servicio`, 'servicio')
        .addSelect(`COUNT(*)`, 'cantidad')
        .addSelect(`SUM(${alias}.deuda)`, 'monto')
        .from((subquery) => {
            const subq = subquery
            .select('s.idservicio', 'idservicio')
            .addSelect('s.servicio', 'servicio')
            .addSelect('s.deuda', 'deuda')
            .from(SuscripcionView, 's')
            .orderBy('s.id', 'DESC');
            return this.addWhereParamsToQuery('s', subq, queries);
        }, alias)
        .groupBy(`${alias}.idservicio`)
        .addGroupBy(`${alias}.servicio`);
        if(queries.limit) query = query.limit(queries.limit);
        if(queries.offset) query = query.offset(queries.offset);
        if(queries.sort){
            const sortOrder: 'ASC' | 'DESC' = queries.sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = queries.sort.substring(1);
            if(sortColumn == 'cantidad') query = query.orderBy(`${sortColumn}`, sortOrder);
            else query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    private getEstadosSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<any>{
        const alias = 'suscripcion';
        let query: SelectQueryBuilder<any> = this.datasource.manager.createQueryBuilder()
        .select(`${alias}.estado`, 'estado')
        .addSelect(`COUNT(*)`, 'cantidad')
        .addSelect(`SUM(${alias}.deuda)`, 'monto')
        .from((subquery) => {
            const subq = subquery
            .select('s.deuda', 'deuda')
            .addSelect('s.estado', 'estado')
            .from(SuscripcionView, 's')
            .orderBy('s.id', 'DESC');
            return this.addWhereParamsToQuery('s', subq, queries);
        }, alias)
        .addGroupBy(`${alias}.estado`);
        return this.addSortOffsetLimitToQuery(alias, query, queries);
    }

    private getDepartamentosSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<any>{
        const alias = 'suscripcion';
        let query: SelectQueryBuilder<any> = this.datasource.manager.createQueryBuilder()
        .select(`${alias}.iddepartamento`, 'iddepartamento')
        .addSelect(`${alias}.departamento`, 'departamento')
        .addSelect(`COUNT(*)`, 'cantidad')
        .addSelect(`SUM(${alias}.deuda)`, 'monto')
        .from((subquery) => {
            const subq = subquery
            .select('s.iddepartamento', 'iddepartamento')
            .addSelect('s.departamento', 'departamento')
            .addSelect('s.deuda', 'deuda')
            .from(SuscripcionView, 's')
            .orderBy('s.id', 'DESC');
            return this.addWhereParamsToQuery('s', subq, queries);
        }, alias)
        .addGroupBy(`${alias}.iddepartamento`)
        .addGroupBy(`${alias}.departamento`);
        if(queries.limit) query = query.limit(queries.limit);
        if(queries.offset) query = query.offset(queries.offset);
        if(queries.sort){
            const sortOrder: 'ASC' | 'DESC' = queries.sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = queries.sort.substring(1);
            if(sortColumn == 'cantidad') query = query.orderBy('COUNT(*)', sortOrder);
            else query = query.orderBy(`${sortColumn}`, sortOrder); 
        }
        return query;

    }

    private getDistritosSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<any>{
        const alias = 'suscripcion';
        let query: SelectQueryBuilder<any> = this.datasource.manager.createQueryBuilder()
        .select(`${alias}.iddistrito`, 'iddistrito')
        .addSelect(`${alias}.distrito`, 'distrito')
        .addSelect(`COUNT(*)`, 'cantidad')
        .addSelect(`SUM(${alias}.deuda)`, 'monto')
        .from((subquery) => {
            let subq = subquery
            .select('s.iddistrito', 'iddistrito')
            .addSelect('s.distrito', 'distrito')
            .addSelect('s.deuda', 'deuda')
            .from(SuscripcionView, 's')
            .orderBy('s.id', 'DESC');
            return this.addWhereParamsToQuery('s', subq, queries);
        }, alias)
        .addGroupBy(`${alias}.iddistrito`)
        .addGroupBy(`${alias}.distrito`);
        if(queries.limit) query = query.limit(queries.limit);
        if(queries.offset) query = query.offset(queries.offset);
        if(queries.sort){
            const sortOrder: 'ASC' | 'DESC' = queries.sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = queries.sort.substring(1);
            if(sortColumn == 'cantidad') query = query.orderBy('COUNT(*)', sortOrder);
            else query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;

    }

    private getBarriosSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<any>{
        const alias = 'suscripcion';
        let query: SelectQueryBuilder<any> = this.datasource.manager.createQueryBuilder()
        .select(`${alias}.idbarrio`, 'idbarrio')
        .addSelect(`${alias}.barrio`, 'barrio')
        .addSelect(`COUNT(*)`, 'cantidad')
        .addSelect(`SUM(${alias}.deuda)`, 'monto')
        .from((subquery) => {
            const subq = subquery
            .select('s.idbarrio', 'idbarrio')
            .addSelect('s.barrio', 'barrio')
            .addSelect('s.deuda', 'deuda')
            .from(SuscripcionView, 's')
            .orderBy('s.id', 'DESC')
            return this.addWhereParamsToQuery('s', subq, queries);
        }, alias)
        .addGroupBy(`${alias}.idbarrio`)
        .addGroupBy(`${alias}.barrio`);
        if(queries.limit) query = query.limit(queries.limit);
        if(queries.offset) query = query.offset(queries.offset);
        if(queries.sort){
            const sortOrder: 'ASC' | 'DESC' = queries.sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = queries.sort.substring(1);
            if(sortColumn == 'cantidad') query = query.orderBy('COUNT(*)', sortOrder);
            else query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    private getResumenGeneralQuery(queries: {[name: string]: any}): SelectQueryBuilder<any>{
        const alias = 'suscripcion';
        let query = this.datasource.manager.createQueryBuilder()
        .select('COUNT(*)', 'cantidadTotal')
        .addSelect(`SUM (CASE WHEN ${alias}.estado = 'C' OR ${alias}.estado = 'R' THEN 1 ELSE 0 END)`, 'cantidadActivos')
        .addSelect(`SUM (CASE WHEN ${alias}.estado = 'D' THEN 1 ELSE 0 END)`, 'cantidadDesconectados')
        .addSelect(`SUM(${alias}.deuda)`, 'monto')
        .from((subquery) => {
            let subq = subquery
            .select('s.estado', 'estado')
            .addSelect('s.deuda', 'deuda')
            .from(SuscripcionView, 's')
            .orderBy('s.id', 'DESC');
            subq = this.addWhereParamsToQuery('s', subq, queries);
            return subq;
        }, alias);
        return query;
    }

    findAllResumenCuotasPendientes(queries: { [name: string]: any }): Promise<ResumenCuotasPendientesSuscripcionesDTO[]> {
        return this.getCuotasPendientesSelectQuery(queries).getRawMany();
    }

    async countResumenCuotasPendientes(queries: {[name: string]: any}): Promise<number>{
        return (await this.getCuotasPendientesSelectQuery(queries).offset(0).limit(0).getRawMany()).length;
    }

    findAllResumenEstados(queries: {[name: string]: any}): Promise<ResumenEstadosSuscripcionesDTO[]>{
        return this.getEstadosSelectQuery(queries).getRawMany();
    }

    async countResumenEstados(queries: {[name: string]: any}): Promise<number>{
        return (await this.getEstadosSelectQuery(queries).offset(0).limit(0).getRawMany()).length;
    }

    findAllResumenGrupos(queries: {[name: string]: any}): Promise<ResumenGruposSuscripcionesDTO[]>{
        return this.getGruposSelectQuery(queries).getRawMany();
    }

    async countResumenGrupos(queries: {[name: string]: any}): Promise<number>{
        return (await this.getGruposSelectQuery(queries).offset(0).limit(0).getRawMany()).length;
    }

    findAllResumenServicios(queries: {[name: string]: any}): Promise<ResumenServiciosSuscripcionDTO[]>{
        return this.getServiciosSelectQuery(queries).getRawMany();
    }

    async countResumenServicios(queries: {[name: string]: any}): Promise<number>{
        return (await this.getServiciosSelectQuery(queries).offset(0).limit(0).getRawMany()).length;
    }

    findAllResumenDistritos(queries: {[name: string]: any}): Promise<ResumenDistritosSuscripcionesDTO[]>{
        return this.getDistritosSelectQuery(queries).getRawMany();
    }

    async countResumenDistritos(queries: {[name: string]: any}): Promise<number>{
        return (await (this.getDistritosSelectQuery(queries).offset(0).limit(0).getRawMany())).length;
    }

    findAllResumenBarrios(queries: {[name: string]: any}): Promise<ResumenBarriosSuscripcionesDTO[]>{
        return this.getBarriosSelectQuery(queries).getRawMany();
    }

    async countResumenBarrios(queries: {[name: string]: any}): Promise<number>{
        return (await this.getBarriosSelectQuery(queries).offset(0).limit(0).getRawMany()).length;
    }

    findAllResumenDepartamentos(queries: {[name: string]: any}): Promise<ResumenDepartamentosSuscripcionesDTO[]>{
        return this.getDepartamentosSelectQuery(queries).getRawMany();
    }

    async countResumenDepartamentos(queries: {[name: string]: any}): Promise<number>{
        return (await (this.getDepartamentosSelectQuery(queries).offset(0).limit(0).getRawMany())).length;
    }

    getResumenGeneral(queries: {[name: string]: any}): Promise<ResumenGeneralSuscripcionesDTO>{
        return this.getResumenGeneralQuery(queries).getRawOne();
    }

}
