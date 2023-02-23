import { FormatoFactura } from '@database/entity/formato-factura.entity';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class FormatoFacturasService {

    constructor(
        @InjectRepository(FormatoFactura)
        private formatoFacturaRepo: Repository<FormatoFactura>,
        private datasource: DataSource
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<FormatoFactura> {
        const { eliminado, sort, offset, limit } = queries;
        const alias = 'formato';
        let query = this.formatoFacturaRepo.createQueryBuilder(alias);
        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (offset) query = query.skip(offset);
        if (limit) query = query.take(limit);
        if (sort) {
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
        }
        return query;
    }

    findAll(queries: { [name: string]: any }): Promise<FormatoFactura[]> {
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: { [name: string]: any }): Promise<number> {
        return this.getSelectQuery(queries).getCount();
    }

    findById(idformato: number): Promise<FormatoFactura> {
        return this.formatoFacturaRepo.findOneByOrFail({ id: idformato });
    }

    async create(formato: FormatoFactura, idusuario: number) {
        await this.datasource.transaction(async manager => {
            await manager.save(formato);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaFormatosFacturas(idusuario, 'R', null, formato));
        });
    }

    async edit(oldId: number, formato: FormatoFactura, idusuario: number) {
        const oldFormato = await this.formatoFacturaRepo.findOneByOrFail({ id: oldId });
        formato.id = oldFormato.id;
        await this.datasource.transaction(async manager => {
            await manager.save(formato);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaFormatosFacturas(idusuario, 'M', oldFormato, formato));
        });
    }

    async delete(id: number, idusuario){
        const formato = await this.formatoFacturaRepo.findOneByOrFail({id});
        const oldFormato = {...formato}
        formato.eliminado = true;
        await this.datasource.transaction(async manager => {
            await manager.save(formato);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaFormatosFacturas(idusuario, 'E', oldFormato, formato));
        })
    }
}
