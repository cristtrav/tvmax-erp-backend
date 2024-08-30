import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { InjectRepository } from '@nestjs/typeorm';
import { Cuota } from '@database/entity/cuota.entity';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { CuotaView } from '@database/view/cuota.view';
import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';
import { CobroCuotasView } from '@database/view/cobro-cuotas.view';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { GeneracionCuotas } from '@database/entity/generacion-cuotas.entity';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { Suscripcion } from '@database/entity/suscripcion.entity';

@Injectable()
export class CuotasService {

    constructor(
        @InjectRepository(Cuota)
        private cuotaRepo: Repository<Cuota>,
        @InjectRepository(CuotaView)
        private cuotaViewRepo: Repository<CuotaView>,
        @InjectRepository(CobroCuotasView)
        private cobroCuotaViewRepo: Repository<CobroCuotasView>,
        @InjectRepository(GeneracionCuotas)
        private generacionCuotasRepo: Repository<GeneracionCuotas>,
        @InjectRepository(Suscripcion)
        private suscripcionRepo: Repository<Suscripcion>,
        private datasource: DataSource
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<CuotaView> {
        const { eliminado, pagado, sort, offset, limit, idservicio, idsuscripcion } = queries;
        const alias: string = "cuota";
        let query: SelectQueryBuilder<CuotaView> = this.cuotaViewRepo.createQueryBuilder(alias);

        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (pagado != null) query = query.andWhere(`${alias}.pagado = :pagado`, { pagado });
        if (idsuscripcion)
            if (Array.isArray(idsuscripcion)) query = query.andWhere(`${alias}.idsuscripcion IN (:...idsuscripcion)`, { idsuscripcion });
            else query = query.andWhere(`${alias}.idsuscripcion = :idsuscripcion`, { idsuscripcion });
        if (idservicio)
            if (Array.isArray(idservicio)) query = query.andWhere(`${alias}.idservicio IN (:...idservicio)`, { idservicio });
            else query = query.andWhere(`${alias}.idservicio = :idservicio`, { idservicio });
        if (limit != null) query = query.take(limit);
        if (offset != null) query = query.skip(offset);
        if (sort) {
            const sortColumn: string = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    private getEventoAuditoria(idusuario: number, operacion: 'R' | 'M' | 'E', estadoanterior: any, estadonuevo: any): EventoAuditoria {
        const evento: EventoAuditoria = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.estadoanterior = estadoanterior;
        evento.estadonuevo = estadonuevo;
        evento.fechahora = new Date();
        evento.idtabla = TablasAuditoriaList.CUOTAS.id;
        return evento;
    }

    async findAll(queries: { [name: string]: any }): Promise<CuotaView[]> {
        return this.getSelectQuery(queries).getMany();
    }

    async count(queries): Promise<number> {
        return this.getSelectQuery(queries).getCount();
    }

    async findById(id: number): Promise<CuotaView> {
        return this.cuotaViewRepo.findOneByOrFail({ id });
    }

    async create(c: Cuota, idusuario: number) {
        const cuotaExistente =
            await this.cuotaViewRepo.createQueryBuilder('cuota')
                .where(`EXTRACT(month FROM cuota.fechaVencimiento) = :mes`, { mes: (c.fechaVencimiento.getMonth() + 1) })
                .andWhere(`EXTRACT(year FROM cuota.fechaVencimiento) = :anio`, { anio: c.fechaVencimiento.getFullYear() })
                .andWhere(`cuota.idsuscripcion = :idsuscripcion`, { idsuscripcion: c.idsuscripcion })
                .andWhere(`cuota.idservicio = :idservicio`, {idservicio: c.idservicio})
                .andWhere(`cuota.eliminado = FALSE`)
                .getOne();
        if(cuotaExistente) throw new HttpException({
            message: `La cuota para el servicio «${cuotaExistente.servicio}» del mes «${format(c.fechaVencimiento, "MMMM yyyy", { locale: es })}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(c);
            await manager.save(this.getEventoAuditoria(idusuario, 'R', null, c));
        })
    }

    async edit(oldid: number, c: Cuota, idusuario: number) {
        await this.datasource.transaction(async manager => {
            const oldCuota: Cuota = await this.cuotaRepo.findOneByOrFail({ id: oldid });
            await manager.save(c);
            const newCuota: Cuota = await this.cuotaRepo.findOneByOrFail({ id: c.id });
            await manager.save(this.getEventoAuditoria(idusuario, "M", oldCuota, newCuota));
            if (oldid != c.id) await manager.remove(oldCuota);
        })
    }

    async delete(id: number, idusuario: number) {
        const cuota: Cuota = await this.cuotaRepo.findOneByOrFail({ id });
        const oldCuota: Cuota = { ...cuota };
        cuota.eliminado = true;
        await this.datasource.transaction(async manager => {
            await manager.save(cuota);
            await manager.save(this.getEventoAuditoria(idusuario, 'E', oldCuota, cuota));
        })
    }

    async findCobro(idcuota: number): Promise<CobroCuotasView> {
        return this.cobroCuotaViewRepo.findOneByOrFail({ idcuota });
    }

    async generarCuotas(mes: number, anio: number){
        if(mes < 1 || mes > 12) return;
        console.log(`Generando cuotas para el mes ${mes} y año ${anio}...`);
        let cantCuotasGeneradas = 0;
        let cantSuscripcionesOmitidas = 0;
        const suscripcionesActivas =
            await this.suscripcionRepo.createQueryBuilder('suscripcion')
                .where(`suscripcion.gentileza = FALSE`)
                .andWhere(new Brackets(qb => {
                    qb = qb.orWhere(`suscripcion.estado = 'C'`)
                    qb = qb.orWhere(`suscripcion.estado = 'R'`)
                }))
                .getMany();

        const generacionCuotas = new GeneracionCuotas();
        generacionCuotas.fechaHoraInicio = new Date();
        generacionCuotas.cantidadCuotasOmitidas = suscripcionesActivas.length;
        await this.generacionCuotasRepo.save(generacionCuotas);

        for (let suscripcion of suscripcionesActivas) {
            const cuotaExistente =
                await this.cuotaRepo.createQueryBuilder('cuota')
                    .where(`EXTRACT(month FROM cuota.fechaVencimiento) = :mes`, { mes })
                    .andWhere(`EXTRACT(year FROM cuota.fechaVencimiento) = :anio`, { anio })
                    .andWhere(`cuota.idsuscripcion = :idsuscripcion`, { idsuscripcion: suscripcion.id })
                    .andWhere(`cuota.idservicio = :idservicio`, {idservicio: suscripcion.idservicio})
                    .andWhere(`cuota.eliminado = FALSE`)
                    .getOne();
            if (!cuotaExistente) {
                const cuota = new Cuota();
                cuota.idsuscripcion = suscripcion.id;
                cuota.eliminado = false;
                cuota.pagado = false;
                cuota.fechaVencimiento = new Date(anio, mes - 1, 1);
                cuota.monto = suscripcion.monto;
                cuota.idservicio = suscripcion.idservicio;
                await this.datasource.transaction(async manager => {
                    await manager.save(cuota);
                    await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCuota(3, 'R', null, cuota));
                    cantCuotasGeneradas++;
                })
            } else cantSuscripcionesOmitidas++
        }
        console.log('Generación de cuotas finalizada...');
        generacionCuotas.cantidadCuotas = cantCuotasGeneradas;
        generacionCuotas.cantidadCuotasOmitidas =cantSuscripcionesOmitidas;
        generacionCuotas.fechaHoraFin = new Date();
        await this.generacionCuotasRepo.save(generacionCuotas);
    }
}
