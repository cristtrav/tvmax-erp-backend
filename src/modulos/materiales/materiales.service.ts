import { Existencia } from '@database/entity/existencia.entity';
import { Material } from '@database/entity/material.entity';
import { MaterialView } from '@database/view/material.view';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class MaterialesService {

    constructor(
        @InjectRepository(Material)
        private materialRepo: Repository<Material>,
        @InjectRepository(MaterialView)
        private materialViewRepo: Repository<MaterialView>,
        @InjectRepository(Existencia)
        private existenciaRepo: Repository<Existencia>,
        private datasource: DataSource
    ){}

    private getSelectQuery(params: {[name:string]: any}): SelectQueryBuilder<MaterialView>{
        const { sort, offset, limit, eliminado, search } = params;
        const alias = 'material';
        let query: SelectQueryBuilder<MaterialView> = this.materialViewRepo.createQueryBuilder(alias);
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if(limit) query = query.take(limit);
        if(offset) query = query.skip(offset);
        if(search) query = query.andWhere(new Brackets(qb => {
            qb.orWhere(`LOWER(${alias}.descripcion) LIKE :dessearch`, {dessearch: `%${search.toLowerCase()}%`});
            if(Number.isInteger(Number(search))) qb.orWhere(`${alias}.id = :idsearch`, {idsearch: Number(search)});
        }));
        if(sort){
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
            if(sortColumn != 'id') query = query.addOrderBy(`${alias}.id`, sortOrder);
        }
        return query;
    }

    findAll(queries: {[name: string]: any}): Promise<MaterialView[]>{
        return this.getSelectQuery(queries).getMany();
    }

    findById(id: number): Promise<MaterialView>{
        return this.materialViewRepo.findOneByOrFail({id});
    }

    count(queries: {[name: string]: any}): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    async create(material: Material, idusuario: number){
        const oldMaterial = await this.materialRepo.findOneBy({id: material.id, eliminado: false});
        if(oldMaterial) throw new HttpException({
            message: `El material con código «${material.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(material);
            await manager.save(this.getExistenciaPorDefecto(material.id));
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaMaterial(idusuario, 'R', oldMaterial, material));
        });
    }

    async update(oldId: number, material: Material, idusuario: number){
        const oldMaterial = await this.materialRepo.findOneByOrFail({id: oldId});

        if(oldId != material.id && await this.materialRepo.findOneBy({id: material.id, eliminado: false})) throw new HttpException({
            message: `El Material con código «${material.id}» ya existe.`
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(material);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaMaterial(idusuario, 'M', oldMaterial, material));
        });
    }

    async delete(id: number, idusuario: number){
        const material = await this.materialRepo.findOneByOrFail({ id });
        const oldMaterial = { ...material };
        material.eliminado = true;

        await this.datasource.transaction(async manager => {
            await manager.save(material);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaMaterial(idusuario, 'E', oldMaterial, material));
        })
    }

    async getLastId(): Promise<number>{
        return (await this.materialRepo
            .createQueryBuilder('material')
            .select(`MAX(material.id)`, 'max')
            .getRawOne()
        ).max;
    }

    private getExistenciaPorDefecto(idmaterial: number): Existencia{
        const existenciaPorDefecto = new Existencia();
        existenciaPorDefecto.iddeposito = 1;
        existenciaPorDefecto.idmaterial = idmaterial;
        existenciaPorDefecto.cantidad = '0.0';
        return existenciaPorDefecto;
    }

}
