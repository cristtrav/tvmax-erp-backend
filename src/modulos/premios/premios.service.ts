import { Premio } from '@database/entity/sorteos/premio.entity';
import { PremioView } from '@database/view/sorteos/premio.view';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class PremiosService {

    constructor(
        @InjectRepository(PremioView)
        private premioViewRepo: Repository<PremioView>,
        @InjectRepository(Premio)
        private premioRepo: Repository<Premio>,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<PremioView>{        
        const { eliminado, sort, offset, limit, idsorteo, search } = queries;
        const alias = 'premio';
        let query = this.premioViewRepo.createQueryBuilder(alias);
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, {eliminado});
        if(idsorteo) query = query.andWhere(`${alias}.idsorteo = :idsorteo`, {idsorteo});
        if(search){
            query = query.andWhere(new Brackets(qb => {
                if(!Number.isNaN(Number(search))) qb = qb.orWhere(`${alias}.id = :idsearch`, {idsearch: Number(search)});
                qb = qb.orWhere(`LOWER(${alias}.descripcion) LIKE :descsearch`, {descsearch: `%${search.toLowerCase()}%`});
                qb = qb.orWhere(`LOWER(${alias}.clienteganador) LIKE :clisearch`, {clisearch: `%${search.toLowerCase()}%`});
            }))
        }
        if(limit) query = query.take(limit);
        if(offset) query = query.skip(offset);
        if(sort){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
            if(sortColumn != 'id') query.addOrderBy(`${alias}.id`, sortOrder);
        }
        return query;
    }

    findAll(queries: QueriesType): Promise<PremioView[]>{
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: QueriesType): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    async getLastId(): Promise<number>{
        return (await this.premioRepo
            .createQueryBuilder('premio')
            .select('MAX(premio.id)', 'max')
            .getRawOne()
        ).max;
    }

    async create(premio: Premio, idusuario: number){
        const oldPremio = await this.premioRepo.findOneBy({id: premio.id});
        if(oldPremio && !oldPremio.eliminado) throw new HttpException({
            message: `El premio con código «${premio.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST)
        if(await this.premioRepo.findOneBy({idsorteo: premio.idsorteo, nroPremio: premio.nroPremio, eliminado: false}))
            throw new HttpException({
                message: `El número de premio «${premio.nroPremio}» ya está registrado.`
            }, HttpStatus.BAD_REQUEST);
        
        await this.datasource.transaction(async manager => {
            await manager.save(premio);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaPremios(idusuario, 'R', oldPremio, premio));
        })
    }

    async update(oldId: number, premio: Premio, idusuario: number){
        const oldPremio = await this.premioRepo.findOneByOrFail({id: oldId, eliminado: false});
        
        if(oldId != premio.id && await this.premioRepo.findOneBy({id: premio.id, eliminado: false})) throw new HttpException({
            message: `El premio con código «${premio.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        if(
            oldPremio.nroPremio != premio.nroPremio &&
            await this.premioRepo.findOneBy({nroPremio: premio.nroPremio, idsorteo: premio.idsorteo, eliminado: false})
        ) throw new HttpException({
            message: `El número de premio «${premio.nroPremio}» ya está registrado.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaPremios(idusuario, 'M', oldPremio, premio));
            await manager.save(premio);
        })
    }

    async delete(idpremio: number, idusuario: number){
        const premio = await this.premioRepo.findOneByOrFail({id: idpremio});
        const oldPremio = { ...premio };
        premio.eliminado = true;

        await this.datasource.transaction(async manager => {
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaPremios(idusuario, 'M', oldPremio, premio));
            await manager.save(premio);
        });
    }

    findById(id: number): Promise<PremioView>{
        return this.premioViewRepo.findOneByOrFail({id});
    }
}

type QueriesType = {[name: string]: any}
