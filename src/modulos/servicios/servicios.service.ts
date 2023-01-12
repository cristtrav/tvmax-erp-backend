import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ServicioDTO } from '../../dto/servicio.dto';
import { DatabaseService } from '../../global/database/database.service';
import { Result } from 'pg';
import { WhereParam } from '@util/whereparam';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Servicio } from '@database/entity/servicio.entity';
import { ServicioView } from '@database/view/servicio.view';
import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';


@Injectable()
export class ServiciosService {

    constructor(
        @InjectRepository(Servicio)
        private servicioRepo: Repository<Servicio>,
        @InjectRepository(ServicioView)
        private servicioViewRepo: Repository<ServicioView>,
        private datasource: DataSource,
        private dbsrv: DatabaseService
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<ServicioView> {
        const { eliminado, idgrupo, suscribible, search, id, sort, offset, limit } = queries;
        const alias: string = 'servicio';
        let queryBuilder: SelectQueryBuilder<ServicioView> = this.servicioViewRepo.createQueryBuilder(alias);

        if (eliminado != null) queryBuilder = queryBuilder.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (idgrupo) queryBuilder = queryBuilder.andWhere(`${alias}.idgrupo = ${Array.isArray(idgrupo) ? 'IN (...:idgrupo)' : '= :idgrupo'}`, { idgrupo });
        if (suscribible != null) queryBuilder = queryBuilder.andWhere(`${alias}.suscribible = :suscribible`, { suscribible });
        if (id) queryBuilder = queryBuilder.andWhere(`${alias}.id = ${Array.isArray(id) ? 'IN (...:id)' : '= :id'}`, { id });
        if (search) {
            queryBuilder = queryBuilder.andWhere(new Brackets((qb) => {
                qb = qb.orWhere(`LOWER(${alias}.descripcion = :descsearch)`, { descsearch: `%${search.toLowerCase()}%` });
                if (!Number.isNaN(Number(search))) qb = qb.orWhere(`${alias}.id = :id`, { id: Number(search) });
            }));
        }

        if (limit) queryBuilder = queryBuilder.take(limit);
        if (offset) queryBuilder = queryBuilder.skip(offset);
        if (sort) {
            const sortColumn: string = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            queryBuilder = queryBuilder.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return queryBuilder;
    }

    private getEventoAuditoria(idusuario: number, operacion: 'R' | 'M' | 'E', estadoanterior: any, estadonuevo: any): EventoAuditoria {
        const evento: EventoAuditoria = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.fechahora = new Date();
        evento.estadoanterior = estadoanterior;
        evento.estadonuevo = estadonuevo;
        evento.idtabla = TablasAuditoriaList.SERVICIOS.id;
        return evento;
    }

    async findAll(queries: { [name: string]: any }): Promise<ServicioView[]> {
        return this.getSelectQuery(queries).getMany();
    }

    async count(queries: { [name: string]: any }): Promise<number> {
        return this.getSelectQuery(queries).getCount();
    }

    async create(s: Servicio, idusuario: number) {
        if (await this.servicioRepo.findOneBy({ id: s.id })) throw new HttpException({
            message: `El servicio con código «${s.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.manager.transaction(async (manager) => {
            await manager.save(s);
            await manager.save(this.getEventoAuditoria(idusuario, 'R', null, s));
        });
    }

    async update(oldId: number, s: Servicio, idusuario: number): Promise<Result> {
        await this.datasource.transaction(async manager => {
            const oldServicio: Servicio = await this.servicioRepo.findOneByOrFail({ id: oldId });
            await manager.save(s);
            const newServicio: Servicio = await this.servicioRepo.findOneByOrFail({ id: s.id });
            await manager.save(this.getEventoAuditoria(idusuario, 'M', oldServicio, newServicio))
            if (Number(oldId) !== s.id) await manager.remove(oldServicio);
        })
    }

    async findById(id: number): Promise<ServicioView> {
        return this.servicioViewRepo.findOneByOrFail({ id });
    }

    async delete(id: number, idusuario: number) {
        const serv: Servicio = await this.servicioRepo.findOneByOrFail({ id });
        const oldServ: Servicio = { ...serv };
        serv.eliminado = true;

        await this.datasource.transaction(async manager => {
            await manager.save(serv);
            await manager.save(this.getEventoAuditoria(idusuario, 'E', oldServ, serv));
        });
    }
    //PENDIENTE DE CAMBIAR A TYPEORM
    async getServiciosEnCuotas(idsusc: number, queryParams): Promise<ServicioDTO[]> {
        const { eliminado, pagado, sort, offset, limit } = queryParams;
        const wp: WhereParam = new WhereParam(
            { 'vw_cuotas.idsuscripcion': idsusc, 'vw_cuotas.pagado': pagado, eliminado },
            null,
            null,
            null,
            { sort, offset, limit }
        );
        const query: string = `SELECT * FROM public.vw_servicios WHERE id IN
        (SELECT vw_cuotas.idservicio AS idcuota FROM public.vw_cuotas ${wp.whereStr}) ${wp.sortOffsetLimitStr}`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows;
    }
    //PENDIENTE DE CAMBIAR A TYPEORM
    async countServiciosEnCuotas(idsusc, queryParams): Promise<number> {
        const { eliminado, pagado } = queryParams;
        const wp: WhereParam = new WhereParam(
            { 'vw_cuotas.idsuscripcion': idsusc, 'vw_cuotas.pagado': pagado },
            null,
            null,
            null,
            null
        );
        var query: string = `SELECT COUNT(*) FROM public.vw_servicios WHERE id IN
        (SELECT vw_cuotas.idservicio AS idservicio FROM public.vw_cuotas ${wp.whereStr})`;
        return (await this.dbsrv.execute(query, wp.whereParams)).rows[0].count;
    }

    async getLastId(): Promise<number> {
        return (
            await this.servicioRepo.createQueryBuilder('servicio')
                .select('MAX(servicio.id)', 'max')
                .getRawOne()
        ).max
    }

}
