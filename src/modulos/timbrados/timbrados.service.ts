import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TablasAuditoriaList } from '@database/tablas-auditoria.list';
import { InjectRepository } from '@nestjs/typeorm';
import { Timbrado } from '@database/entity/timbrado.entity';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { TimbradoView } from '@database/view/timbrado.view';
import { EventoAuditoria } from '@database/entity/evento-auditoria.entity';
import { FormatoFactura } from '@database/entity/formato-factura.entity';

@Injectable()
export class TimbradosService {

    constructor(
        @InjectRepository(Timbrado)
        private timbradoRepo: Repository<Timbrado>,
        @InjectRepository(TimbradoView)
        private timbradoViewRepo: Repository<TimbradoView>,
        private datasource: DataSource
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<TimbradoView> {
        const { eliminado, activo, electronico, sort, offset, limit } = queries;
        const alias: string = 'timbrado';
        let query: SelectQueryBuilder<TimbradoView> = this.timbradoViewRepo.createQueryBuilder(alias);

        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (activo != null) query = query.andWhere(`${alias}.activo = :activo`, { activo });
        if (electronico != null) query = query.andWhere(`${alias}.electronico`, {electronico});
        if (offset) query = query.skip(offset);
        if (limit) query = query.take(limit);
        if (sort) {
            const sortColumn: string = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    private getEventoAuditoria(idusuario, operacion: 'R' | 'M' | 'E', oldValue: any, newValue: any): EventoAuditoria {
        const evento: EventoAuditoria = new EventoAuditoria();
        evento.operacion = operacion;
        evento.idtabla = TablasAuditoriaList.TIMBRADOS.id;
        evento.fechahora = new Date();
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        evento.idusuario = idusuario;
        return evento;
    }

    findAll(queries: { [name: string]: any }): Promise<TimbradoView[]> {
        return this.getSelectQuery(queries).getMany();
    }

    findById(id: number): Promise<TimbradoView> {
        return this.timbradoViewRepo.findOneByOrFail({ id });
    }

    count(queries: { [name: string]: any }): Promise<number> {
        return this.getSelectQuery(queries).getCount();
    }

    async getLastId(): Promise<number>{
        return (await this.timbradoRepo.createQueryBuilder('timbrado')
        .select(`MAX(timbrado.id)`, 'lastid')
        .getRawOne()).lastid
    }

    async create(t: Timbrado, idusuario: number) {
        const oldTimbrado = await this.timbradoRepo.findOneBy({id: t.id});
        if(oldTimbrado != null && !oldTimbrado.eliminado) throw new HttpException({
            message: `El timbrado con código «${t.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(t);
            await manager.save(this.getEventoAuditoria(idusuario, 'R', oldTimbrado, t));
        });
    }

    async edit(oldid: number, t: Timbrado, idusuario: number) {
        const oldTimbrado = await this.timbradoRepo.findOneByOrFail({id: oldid});

        if(oldid != t.id && await this.timbradoRepo.findOneBy({id: t.id, eliminado: false})) throw new HttpException({
            message: `El timbrado con código «${t.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);
        
        await this.datasource.transaction(async manager => {
            await manager.save(t);
            await manager.save(this.getEventoAuditoria(idusuario, 'M', oldTimbrado, t));
        })
    }

    async delete(id: number, idusuario: number) {
        const timbrado = await this.timbradoRepo.findOneByOrFail({id});
        const oldTimbrado: Timbrado = { ...timbrado };
        timbrado.eliminado = true;

        await this.datasource.transaction(async manager => {
            await manager.save(timbrado);
            await manager.save(this.getEventoAuditoria(idusuario, 'E', oldTimbrado, timbrado));
        });
    }

    async findFormatoByIdtimbrado(idtimbrado: number): Promise<FormatoFactura>{
        return (await this.timbradoRepo.findOne({
            where: {id: idtimbrado},
            relations: {formato: true}
        })).formato;
        /*if(formato == null) throw new HttpException({
            message: 'No se encontró el formato de impresón'
        }, HttpStatus.NOT_FOUND);
        return formato;*/
    }
}
