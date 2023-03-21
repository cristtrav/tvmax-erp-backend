import { Cuota } from '@database/entity/cuota.entity';
import { GeneracionCuotas } from '@database/entity/generacion-cuotas.entity';
import { Suscripcion } from '@database/entity/suscripcion.entity';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';

@Injectable()
export class CuotasScheduleService {

    constructor(
        @InjectRepository(Suscripcion)
        private suscripcionRepo: Repository<Suscripcion>,
        @InjectRepository(Cuota)
        private cuotaRepo: Repository<Cuota>,
        @InjectRepository(GeneracionCuotas)
        private generacionCuotasRepo: Repository<GeneracionCuotas>,
        private datasource: DataSource
    ) { }

    @Cron('0 6 1 * *')
    async generarCuotasSuscripcionesActivas() {
        console.log('Generando cuotas...');
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
            const fechaHoraActual = new Date();
            const cuotaExistente =
                await this.cuotaRepo.createQueryBuilder('cuota')
                    .where(`EXTRACT(month FROM cuota.fechaVencimiento) = :mes`, { mes: (fechaHoraActual.getMonth() + 1) })
                    .andWhere(`EXTRACT(year FROM cuota.fechaVencimiento) = :anio`, { anio: fechaHoraActual.getFullYear() })
                    .andWhere(`cuota.idsuscripcion = :idsuscripcion`, { idsuscripcion: suscripcion.id })
                    .andWhere(`cuota.idservicio = :idservicio`, {idservicio: suscripcion.idservicio})
                    .andWhere(`cuota.eliminado = FALSE`)
                    .getOne();
            if (!cuotaExistente) {
                const cuota = new Cuota();
                cuota.idsuscripcion = suscripcion.id;
                cuota.eliminado = false;
                cuota.pagado = false;
                cuota.fechaVencimiento = new Date(fechaHoraActual.getFullYear(), fechaHoraActual.getMonth(), 1);
                cuota.monto = suscripcion.monto;
                cuota.idservicio = suscripcion.idservicio;
                await this.datasource.transaction(async manager => {
                    await manager.save(cuota);
                    await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCuota(3, 'R', null, cuota));
                    cantCuotasGeneradas++;
                })
            } else cantSuscripcionesOmitidas++
        }
        console.log('Finalizado...');
        generacionCuotas.cantidadCuotas = cantCuotasGeneradas;
        generacionCuotas.cantidadCuotasOmitidas =cantSuscripcionesOmitidas;
        generacionCuotas.fechaHoraFin = new Date();
        await this.generacionCuotasRepo.save(generacionCuotas);
    }
}
