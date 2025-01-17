import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Talonario } from '@database/entity/facturacion/talonario.entity';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { TalonarioView } from '@database/view/facturacion/talonario.view';
import { FormatoFactura } from '@database/entity/formato-factura.entity';

@Injectable()
export class TalonariosService {

    constructor(
        @InjectRepository(Talonario)
        private talonarioRepo: Repository<Talonario>,
        @InjectRepository(TalonarioView)
        private talonarioViewRepo: Repository<TalonarioView>,
        private datasource: DataSource
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<TalonarioView> {
        const { eliminado, activo, electronico, sort, offset, limit } = queries;
        const alias: string = 'talonario';
        let query: SelectQueryBuilder<TalonarioView> = this.talonarioViewRepo.createQueryBuilder(alias);

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

    findAll(queries: { [name: string]: any }): Promise<TalonarioView[]> {
        return this.getSelectQuery(queries).getMany();
    }

    findById(id: number): Promise<TalonarioView> {
        return this.talonarioViewRepo.findOneByOrFail({ id });
    }

    count(queries: { [name: string]: any }): Promise<number> {
        return this.getSelectQuery(queries).getCount();
    }

    async getLastId(): Promise<number>{
        return (await this.talonarioRepo.createQueryBuilder('timbrado')
        .select(`MAX(timbrado.id)`, 'lastid')
        .getRawOne()).lastid
    }

    async create(t: Talonario, idusuario: number) {
        const oldTimbrado = await this.talonarioRepo.findOneBy({id: t.id});
        if(oldTimbrado != null && !oldTimbrado.eliminado) throw new HttpException({
            message: `El timbrado con código «${t.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(t);
            await manager.save(Talonario.getEventoAuditoria(idusuario, 'R', oldTimbrado, t));
        });
    }

    async edit(oldid: number, t: Talonario, idusuario: number) {
        const oldTimbrado = await this.talonarioRepo.findOneByOrFail({id: oldid});

        if(oldid != t.id && await this.talonarioRepo.findOneBy({id: t.id, eliminado: false})) throw new HttpException({
            message: `El timbrado con código «${t.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);
        
        await this.datasource.transaction(async manager => {
            await manager.save(t);
            await manager.save(Talonario.getEventoAuditoria(idusuario, 'M', oldTimbrado, t));
        })
    }

    async delete(id: number, idusuario: number) {
        const timbrado = await this.talonarioRepo.findOneByOrFail({id});
        const oldTimbrado = { ...timbrado };
        timbrado.eliminado = true;

        await this.datasource.transaction(async manager => {
            await manager.save(timbrado);
            await manager.save(Talonario.getEventoAuditoria(idusuario, 'E', oldTimbrado, timbrado));
        });
    }

    async findFormatoByIdtalonario(idtalonario: number): Promise<FormatoFactura>{
        return (await this.talonarioRepo.findOne({
            where: {id: idtalonario},
            relations: {formato: true}
        })).formato;
    }
}
