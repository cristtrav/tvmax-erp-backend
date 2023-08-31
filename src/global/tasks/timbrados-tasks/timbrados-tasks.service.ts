import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';
import { Timbrado } from '@database/entity/timbrado.entity';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';

@Injectable()
export class TimbradosTasksService {

    constructor(
        @InjectRepository(Timbrado)
        private timbradoRepo: Repository<Timbrado>,
        private datasource: DataSource
    ){ }

    @Cron('0 11,17 * * *')
    async desactivarTimbradosVencidos(){
        console.log('Analizando timbrados vencidos y finalizados...');
        const timbrados = 
            await this.timbradoRepo.createQueryBuilder('timbrado')
            .andWhere(new Brackets(qb => {
                qb = qb.orWhere(`:currentdate >= timbrado.fechaVencimiento`, { currentdate: new Date()});
                qb = qb.orWhere(`timbrado.ultimoNroUsado >= timbrado.nroFin`);
            }))
            .andWhere(`timbrado.activo = true`)
            .getMany();
        for(let timbrado of timbrados){
            const oldTimbrado = { ...timbrado };
            timbrado.activo = false;
            await this.datasource.manager.transaction(async (manager) => {
                await manager.save(timbrado);
                await manager.save(this.getEventoAuditoria(3, 'M', oldTimbrado, timbrado));
            });
        }
    }

    private getEventoAuditoria(idusuario: number, operacion: 'R' | 'M' | 'E', estadoanterior: any, estadonuevo: any): EventoAuditoria {
        const evento: EventoAuditoria = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.fechahora = new Date();
        evento.estadoanterior = estadoanterior;
        evento.estadonuevo = estadonuevo;
        evento.idtabla = TablasAuditoriaList.TIMBRADOS.id;
        return evento;
    }

}
