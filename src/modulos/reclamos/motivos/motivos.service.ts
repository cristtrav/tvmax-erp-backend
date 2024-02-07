import { Motivo } from '@database/entity/reclamos/motivo.entity';
import { MotivoReclamoDTO } from '@dto/reclamos/motivo.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class MotivosService {    

    constructor(
        @InjectRepository(Motivo)
        private motivoRepo: Repository<Motivo>,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<Motivo>{
        const { eliminado, sort, offset, limit, search} = queries;
        const alias = 'motivo';
        let query = this.motivoRepo.createQueryBuilder(alias);
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, {eliminado});
        if(offset) query = query.skip(offset);
        if(limit) query = query.take(limit);
        if(search){
            query = query.andWhere(new Brackets(qb => {
                if(Number.isInteger(Number(search))) qb = qb.orWhere(`${alias}.id = :idsearch`, {idsearch: Number(search)});
                qb = qb.orWhere(`LOWER(${alias}.descripcion) LIKE :descsearch`, {descsearch: `%${search.toLowerCase()}%`});
            }))
        }
        if(sort){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
            if(sortColumn != 'id') query.addOrderBy(`${alias}.id`, sortOrder);
        }
        return query;
    }

    findAll(queries: {[name: string]: any}): Promise<Motivo[]>{
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: {[name: string]: any}): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    findById(id: number): Promise<MotivoReclamoDTO>{
        return this.motivoRepo.findOneByOrFail({id});
    }

    async create(motivo: Motivo, idusuario: number){
        const oldMotivo = await this.motivoRepo.findOneBy({id: motivo.id, eliminado: false});
        if(oldMotivo) throw new HttpException({
            message: `El motivo con código «${oldMotivo.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(motivo);
            await manager.save(Motivo.getEventoAuditoria(idusuario, 'R', oldMotivo, motivo));
        });
    }

    async update(oldId: number, motivo: Motivo, idusuario: number){
        const oldMotivo = await this.motivoRepo.findOneBy({id: oldId})
        if(!oldMotivo) throw new HttpException({
            message: `No se encuentra el motivo con código ${oldId}.`
        }, HttpStatus.NOT_FOUND)

        if(oldId != motivo.id && await this.motivoRepo.findOneBy({id: motivo.id, eliminado: false})) throw new HttpException({
            message: `El motivo con código ${motivo.id} ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(motivo);
            await manager.save(Motivo.getEventoAuditoria(idusuario, 'M', oldMotivo, motivo));
            if(oldId != motivo.id) await manager.remove(oldMotivo);
        })
    }

    async delete(id: number, idusuario: number){
        const motivo = await this.motivoRepo.findOneBy({id});
        if(!motivo) throw new HttpException({
            message: `No se encuentra el motivo ${motivo}.`
        }, HttpStatus.NOT_FOUND);
        const oldMotivo = {...motivo};
        motivo.eliminado = true;

        await this.datasource.transaction(async manager => {
            await manager.save(motivo);
            await manager.save(Motivo.getEventoAuditoria(idusuario, 'E', oldMotivo, motivo));
        })
    }

    async getLastId(): Promise<number>{
        return (await this.motivoRepo.createQueryBuilder('motivo')
        .select('MAX(motivo.id)', 'lastid')
        .getRawOne()).lastid;
    }

}
