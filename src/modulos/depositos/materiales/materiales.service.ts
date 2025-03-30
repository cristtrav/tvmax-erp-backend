import { DetalleMovimientoMaterial } from '@database/entity/depositos/detalle-movimiento-material.entity';
import { Existencia } from '@database/entity/depositos/existencia.entity';
import { MaterialIdentificable } from '@database/entity/depositos/material-identificable.entity';
import { Material } from '@database/entity/depositos/material.entity';
import { MaterialView } from '@database/view/depositos/material.view';
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
        @InjectRepository(MaterialIdentificable)
        private materialIdentificableRepo: Repository<MaterialIdentificable>,
        @InjectRepository(DetalleMovimientoMaterial)
        private detalleMovimientoMaterialRepo: Repository<DetalleMovimientoMaterial>,
        private datasource: DataSource
    ){}

    private getSelectQuery(params: {[name:string]: any}): SelectQueryBuilder<MaterialView>{
        const { sort, offset, limit, eliminado, search, idtipomaterial } = params;        
        const alias = 'material';
        let query: SelectQueryBuilder<MaterialView> = this.materialViewRepo.createQueryBuilder(alias);
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if(idtipomaterial){
            if(Array.isArray(idtipomaterial)) query = query.andWhere(`${alias}.idtipomaterial IN (:...idtipomaterial)`, { idtipomaterial });
            else query = query.andWhere(`${alias}.idtipomaterial = :idtipomaterial`, { idtipomaterial });
        }
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
            if(oldId != material.id){
                
                const oldExistencia = await this.existenciaRepo.findOneBy({iddeposito: 1, idmaterial: oldId});
                const existencia = new Existencia();
                existencia.idmaterial = material.id;
                existencia.iddeposito = 1;
                existencia.cantidad = oldExistencia.cantidad;
                await manager.save(existencia);

                const oldIdentificables = await this.materialIdentificableRepo.findBy({idmaterial: oldId});
                for(let oldIdent of oldIdentificables){
                    const identif = new MaterialIdentificable();
                    identif.idmaterial = material.id;
                    identif.serial = oldIdent.serial;
                    identif.disponible = oldIdent.disponible;
                    await manager.save(identif);
                }

                const detallesMovimientos = await this.detalleMovimientoMaterialRepo.findBy({idmaterial: oldId});
                for(let detalle of detallesMovimientos){
                    detalle.idmaterial = material.id;
                    await manager.save(detalle);
                }
                await manager.remove(oldExistencia);
                for(let oldIdent of oldIdentificables) await manager.remove(oldIdent);
                await manager.remove(oldMaterial);
            }
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

    private getIdentificableSelectQuery(queries: QueriesType): SelectQueryBuilder<MaterialIdentificable>{
        const alias = 'matident';
        const { disponible, idmaterial, eliminado, offset, limit, sort } = queries;
        let query = this.materialIdentificableRepo.createQueryBuilder(alias);
        if(idmaterial != null) query = query.andWhere(`${alias}.idmaterial = :idmaterial`, {idmaterial});
        if(disponible != null) query = query.andWhere(`${alias}.disponible = :disponible`, {disponible});
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado` , { eliminado });
        if(offset) query = query.skip(offset);
        if(limit) query = query.take(limit);
        if(sort){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
            if(sortColumn != 'serial') query = query.addOrderBy(`${alias}.serial`, sortOrder);
        }
        return query;
    }

    findAllIdentificables(queries: QueriesType): Promise<MaterialIdentificable[]>{
        return this.getIdentificableSelectQuery(queries).getMany();
    }

    countIdentificables(queries: QueriesType): Promise<number>{
        return this.getIdentificableSelectQuery(queries).getCount();
    }

    async getUltimoNroSerieAutogenerado(idmaterial: number): Promise<string> {
        const alias = 'identificable';
        const matIdent =
            await this.materialIdentificableRepo
            .createQueryBuilder(alias)
            .where(`${alias}.idmaterial = :idmaterial`, {idmaterial})
            .andWhere(`${alias}.serial LIKE 'TVMX%'`)
            .orderBy(`SUBSTRING(${alias}.serial, 9)::integer`, 'DESC')
            .getOne();
        if(matIdent) return matIdent.serial;
        else return ''
    }

}

type QueriesType = {[name: string]: any}
