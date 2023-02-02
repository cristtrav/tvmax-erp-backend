import { SuscripcionView } from '@database/view/suscripcion.view';
import { ResumenBarriosSuscripcionesDTO } from '@dto/resumen-barrios-suscripciones.dto';
import { ResumenCuotasPendientesSuscripcionesDTO } from '@dto/resumen-cuotas-pendientes-suscripciones.dto';
import { ResumenDepartamentosSuscripcionesDTO } from '@dto/resumen-departamentos-suscripciones.dto';
import { ResumenDistritosSuscripcionesDTO } from '@dto/resumen-distritos-suscripciones.dto';
import { ResumenEstadosSuscripcionesDTO } from '@dto/resumen-estados-suscripciones.dto';
import { ResumenGeneralSuscripcionesDTO } from '@dto/resumen-general-suscripciones.dto';
import { ResumenGruposSuscripcionesDTO } from '@dto/resumen-grupos-suscripciones.dto';
import { ResumenServiciosSuscripcionDTO } from '@dto/resumen-servicios-suscripcion.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class ResumenesSuscripcionesService {

    constructor(
        @InjectRepository(SuscripcionView)
        private suscripcionViewRepo: Repository<SuscripcionView>
    ){}

    private addWhereParamsToQuery(
        alias: string,
        queryBuilder: SelectQueryBuilder<SuscripcionView>,
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
            sort,
            offset,
            limit
        } = queries;
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

        if (estado) queryBuilder = queryBuilder.andWhere(`${alias}.estado = :estado`, { estado });
        if (fechainiciosuscripcion) queryBuilder = queryBuilder.andWhere(`${alias}.fechasuscripcion >= :fechainiciosuscripcion`, { fechainiciosuscripcion: new Date(`${fechainiciosuscripcion}T00:00:00`) });
        if (fechafinsuscripcion) queryBuilder = queryBuilder.andWhere(`${alias}.fechasuscripcion <= :fechafinsuscripcion`, { fechafinsuscripcion: new Date(`${fechafinsuscripcion}T00:00:00`) });
        if (cuotaspendientesdesde) queryBuilder = queryBuilder.andWhere(`${alias}.cuotaspendientes >= :cuotaspendientesdesde`, { cuotaspendientesdesde });
        if (cuotaspendienteshasta) queryBuilder = queryBuilder.andWhere(`${alias}.cuotaspendientes <= :cuotaspendienteshasta`, { cuotaspendienteshasta });
        if (search){
            queryBuilder = queryBuilder.andWhere(new Brackets(qb => {
                if(Number.isInteger(Number(search))) qb = qb.orWhere(`${alias}.id = :idsearch`, {idsearch: search});
                qb = qb.orWhere(`LOWER(${alias}.cliente) LIKE :clisearch`, { clisearch: `%${search.toLowerCase()}%`});
            }));
        }
        if(offset) queryBuilder = queryBuilder.offset(offset);
        if(limit) queryBuilder = queryBuilder.limit(limit);
        if(sort) {
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            queryBuilder = queryBuilder.orderBy(`${sortColumn}`, sortOrder);
        }
        return queryBuilder;
    }

    private getCuotasPendientesSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<SuscripcionView> {
        const alias = 'resumen';
        let query = this.suscripcionViewRepo.createQueryBuilder(alias)
        .select(`${alias}.cuotaspendientes`, 'nrocuotas')
        .addSelect(`COUNT(*)`, 'cantidad')
        .addSelect(`SUM(${alias}.deuda)`, 'monto')
        .addGroupBy(`${alias}.cuotaspendientes`);
        return this.addWhereParamsToQuery(alias, query, queries);
    }

    private getGruposSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<SuscripcionView>{
        const alias = 'resumen';
        let query = this.suscripcionViewRepo.createQueryBuilder(alias)
        .select(`${alias}.idgrupo`, 'idgrupo')
        .addSelect(`${alias}.grupo`, 'grupo')
        .addSelect(`COUNT(*)`, 'cantidad')
        .addSelect(`SUM(${alias}.deuda)`, 'monto')
        .addGroupBy(`${alias}.idgrupo`)
        .addGroupBy(`${alias}.grupo`);
        return this.addWhereParamsToQuery(alias, query, queries);
    }

    private getServiciosSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<SuscripcionView>{
        const alias = 'resumen';
        let query = this.suscripcionViewRepo.createQueryBuilder(alias)
        .select(`${alias}.idservicio`, 'idservicio')
        .addSelect(`${alias}.servicio`, 'servicio')
        .addSelect(`COUNT(*)`, 'cantidad')
        .addSelect(`SUM(${alias}.deuda)`, 'monto')
        .addGroupBy(`${alias}.idservicio`)
        .addGroupBy(`${alias}.servicio`);
        return this.addWhereParamsToQuery(alias, query, queries);
    }

    private getEstadosSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<SuscripcionView>{
        const alias = 'suscripcion';
        let query = this.suscripcionViewRepo.createQueryBuilder(alias)
        .select(`${alias}.estado`, 'estado')
        .addSelect(`COUNT(*)`, 'cantidad')
        .addSelect(`SUM(${alias}.deuda)`, 'monto')
        .addGroupBy(`${alias}.estado`);
        return this.addWhereParamsToQuery(alias, query, queries);
    }

    private getDepartamentosSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<SuscripcionView>{
        const alias = 'suscripcion';
        let query = this.suscripcionViewRepo.createQueryBuilder(alias)
        .select(`${alias}.iddepartamento`, 'iddepartamento')
        .addSelect(`${alias}.departamento`, 'departamento')
        .addSelect(`COUNT(*)`, 'cantidad')
        .addSelect(`SUM(${alias}.deuda)`, 'monto')
        .addGroupBy(`${alias}.iddepartamento`)
        .addGroupBy(`${alias}.departamento`);
        return this.addWhereParamsToQuery(alias, query, queries);

    }

    private getDistritosSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<SuscripcionView>{
        const alias = 'suscripcion';
        let query = this.suscripcionViewRepo.createQueryBuilder(alias)
        .select(`${alias}.iddistrito`, 'iddistrito')
        .addSelect(`${alias}.distrito`, 'distrito')
        .addSelect(`COUNT(*)`, 'cantidad')
        .addSelect(`SUM(${alias}.deuda)`, 'monto')
        .addGroupBy(`${alias}.iddistrito`)
        .addGroupBy(`${alias}.distrito`);
        return this.addWhereParamsToQuery(alias, query, queries);

    }

    private getBarriosSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<SuscripcionView>{
        const alias = 'suscripcion';
        let query = this.suscripcionViewRepo.createQueryBuilder(alias)
        .select(`${alias}.idbarrio`, 'idbarrio')
        .addSelect(`${alias}.barrio`, 'barrio')
        .addSelect(`COUNT(*)`, 'cantidad')
        .addSelect(`SUM(${alias}.deuda)`, 'monto')
        .addGroupBy(`${alias}.idbarrio`)
        .addGroupBy(`${alias}.barrio`);
        return this.addWhereParamsToQuery(alias, query, queries);
    }

    private getResumenGeneralQuery(queries: {[name: string]: any}): SelectQueryBuilder<SuscripcionView>{
        const alias = 'suscripcion';
        let query = this.suscripcionViewRepo.createQueryBuilder(alias)
        .select('COUNT(*)', 'cantidadTotal')
        .addSelect(`SUM (CASE WHEN ${alias}.estado = 'C' OR ${alias}.estado = 'R' THEN 1 ELSE 0 END)`, 'cantidadActivos')
        .addSelect(`SUM (CASE WHEN ${alias}.estado = 'D' THEN 1 ELSE 0 END)`, 'cantidadDesconectados')
        .addSelect(`SUM(${alias}.deuda)`, 'monto');
        return this.addWhereParamsToQuery(alias, query, queries);
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
        return (await (this.getBarriosSelectQuery(queries).offset(0).limit(0).getRawMany())).length;
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
