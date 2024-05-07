import { DetalleReclamo } from '@database/entity/reclamos/detalle-reclamo.entity';
import { MaterialUtilizado } from '@database/entity/reclamos/material-utilzado.entity';
import { EstadoReclamoType, Reclamo } from '@database/entity/reclamos/reclamo.entity';
import { TablaAuditoria } from '@database/entity/tabla-auditoria.entity';
import { MaterialUtilizadoView } from '@database/view/reclamos/material-utilizado.view';
import { ReclamoView } from '@database/view/reclamos/reclamo.view';
import { DetalleReclamoDTO } from '@dto/reclamos/detalle-reclamo.dto';
import { FinalizacionReclamoDTO } from '@dto/reclamos/finalizacion-reclamo.dto';
import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, QueryBuilder, Repository, SelectQueryBuilder } from 'typeorm';

type QueriesType = {[name: string]: any}

@Injectable()
export class ReclamosService implements OnModuleInit {

    constructor(
        @InjectRepository(ReclamoView)
        private reclamoViewRepo: Repository<ReclamoView>,
        @InjectRepository(Reclamo)
        private reclamoRepo: Repository<Reclamo>,
        @InjectRepository(TablaAuditoria)
        private tablaAuditoriaRepo: Repository<TablaAuditoria>,
        @InjectRepository(DetalleReclamo)
        private detalleReclamoRepo: Repository<DetalleReclamo>,
        @InjectRepository(MaterialUtilizadoView)
        private materialUtilizadoViewRepo: Repository<MaterialUtilizadoView>,
        @InjectRepository(MaterialUtilizado)
        private materialUtilizadoRepo: Repository<MaterialUtilizado>,
        private datasource: DataSource
    ){}

    async onModuleInit() {
        if(!await this.tablaAuditoriaRepo.findOneBy({id: Reclamo.TABLA_AUDITORIA.id}))
            await this.tablaAuditoriaRepo.save(Reclamo.TABLA_AUDITORIA);
        if(!await this.tablaAuditoriaRepo.findOneBy({id: DetalleReclamo.TABLA_AUDITORIA.id}))
            await this.tablaAuditoriaRepo.save(DetalleReclamo.TABLA_AUDITORIA);
    }

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<ReclamoView>{
        const {
            eliminado,
            sort,
            offset,
            limit,
            search,
            fechadesde,
            fechahasta,
            estado,
            idusuarioresponsable,
            idusuarioregistro,
            responsableasignado
        } = queries;
        const alias = 'reclamo';
        let query = this.reclamoViewRepo.createQueryBuilder(alias);
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, {eliminado});
        if(fechadesde) query = query.andWhere(`${alias}.fecha >= :fechadesde`, { fechadesde });
        if(fechahasta) query = query.andWhere(`${alias}.fecha <= :fechahasta`, { fechahasta });
        if(idusuarioresponsable) query = query.andWhere(`${alias}.idusuarioresponsable = :idusuarioresponsable`, { idusuarioresponsable });
        if(idusuarioregistro) query = query.andWhere(`${alias}.idusuarioregistro = :idusuarioregistro`, { idusuarioregistro });
        if(responsableasignado != null && responsableasignado == 'true') query = query.andWhere(`${alias}.idusuarioresponsable IS NOT NULL`);
        if(responsableasignado != null && responsableasignado == 'false') query = query.andWhere(`${alias}.idusuarioresponsable IS NULL`);
        if(estado)
            if(Array.isArray(estado)) query = query.andWhere(`${alias}.estado IN (:...estado)`, { estado });
            else query = query.andWhere(`${alias}.estado = :estado`, { estado });
        if(limit) query = query.take(limit);
        if(offset) query = query.skip(offset);
        if(search){
            query = query.andWhere(new Brackets((qb) => {
                if(Number.isInteger(Number(search))) qb = qb.orWhere(`${alias}.id = :idsearch`, {idsearch: Number(search)});
                qb = qb.orWhere(`LOWER(${alias}.cliente) LIKE :clisearch`, { clisearch: `%${search.toLowerCase()}%`});
            }));            
        }
        if(sort){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
            if(sortColumn != 'id') query = query.addOrderBy(`${alias}.id`, sortOrder);
        }
        return query;
    }

    findAll(queries: QueriesType): Promise<ReclamoView[]>{
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: QueriesType): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    findById(id: number): Promise<ReclamoView>{
        return this.reclamoViewRepo.findOneBy({id});
    }

    async create(reclamo: Reclamo, detalles: DetalleReclamoDTO[], idusuario: number): Promise<number> {
        let idreclamo: number = -1;
        await this.datasource.transaction(async manager => {
            reclamo.fechaHoraCambioEstado = new Date();
            reclamo.idusuarioRegistro = idusuario;
            idreclamo = (await manager.save(reclamo)).id;
            await manager.save(Reclamo.getEventoAuditoria(idusuario, 'R', null, reclamo));

            for(let detalle of detalles){
                delete detalle.id;
                detalle.idreclamo = idreclamo;
                await manager.save(detalle);
                await manager.save(DetalleReclamo.getEventoAuditoria(idusuario, 'R', null, detalle));
            }
        })
        return idreclamo;
    }

    async update(oldId: number, reclamo: Reclamo, detalles: DetalleReclamo[], idusuario: number){
        const oldReclamo = await this.reclamoRepo.findOneBy({id: oldId, eliminado: false});
        const oldDetalles = await this.detalleReclamoRepo.findBy({idreclamo: oldId, eliminado: false});
        const detallesEliminados = oldDetalles.filter(od => !detalles.find(d => d.id == od.id));
        
        const materialesUtilizados = await this.materialUtilizadoRepo.findBy({idreclamo: oldId});

        if(!oldReclamo) throw new HttpException({
            message: `No se encuentra el reclamo con código «${oldId}».`
        }, HttpStatus.NOT_FOUND);

        await this.datasource.transaction(async manager => {
            await manager.save(reclamo);
            await manager.save(Reclamo.getEventoAuditoria(idusuario, 'M', oldReclamo, reclamo));

            for(let detalleEliminado of detallesEliminados){
                const oldDetalle = {...detalleEliminado};
                detalleEliminado.eliminado = true;
                await manager.save(detalleEliminado);
                await manager.save(DetalleReclamo.getEventoAuditoria(idusuario, 'E', oldDetalle, detalleEliminado));
            }

            for(let detalle of detalles){
                if(!oldDetalles.find(od => od.id == detalle.id)){
                    delete detalle.id;
                    detalle.idreclamo = reclamo.id;
                }
                await manager.save(detalle);
                await manager.save(DetalleReclamo.getEventoAuditoria(
                    idusuario,
                    detalle.id == null ? 'R' : 'M',
                    oldDetalles.find(od => od.id == detalle.id),
                    detalle
                ));
            }
            if(reclamo.estado != 'FIN' && reclamo.estado != 'OTR'){
                for(let matUtil of materialesUtilizados){
                    const oldMatUtil = { ...matUtil };
                    matUtil.eliminado = true;
                    await manager.save(matUtil);
                    await manager.save(MaterialUtilizado.getEventoAuditoria(idusuario, 'E', oldMatUtil, matUtil));
                }
            }
        });
    }

    async delete(idreclamo: number, idusuario: number){
        const reclamo = await this.reclamoRepo.findOne({
            where: { id: idreclamo, eliminado: false},
            relations: { detalles: true }
        });
        
        if(!reclamo) throw new HttpException({
            message: `No se encuentra el reclamo con código «${idreclamo}».`
        }, HttpStatus.NOT_FOUND);

        const oldReclamo = { ...reclamo };

        await this.datasource.transaction(async manager => {
            reclamo.eliminado = true;
            await manager.save(reclamo);
            await manager.save(Reclamo.getEventoAuditoria(idusuario, 'E', oldReclamo, reclamo));
            for(let detalle of reclamo.detalles){
                const oldDetalle = { ...detalle };
                detalle.eliminado = false;
                await manager.save(detalle);
                await manager.save(DetalleReclamo.getEventoAuditoria(idusuario, 'E', oldDetalle, detalle));
            }
        })
    }

    async asignarResponsable(idreclamo: number, idusuarioResponsable: number, idusuario: number){
        const reclamo = await this.reclamoRepo.findOneByOrFail({id: idreclamo});
        if(reclamo.idusuarioResponsable) throw new HttpException({
            message: 'El reclamo ya fue tomado'
        }, HttpStatus.BAD_REQUEST);
        const oldReclamo = { ...reclamo };
        reclamo.idusuarioResponsable = idusuarioResponsable;
        await this.datasource.transaction(async manager => {
            await manager.save(reclamo);
            await manager.save(Reclamo.getEventoAuditoria(idusuario, 'M', oldReclamo, reclamo));
        });
    }

    async liberarResponsable(idreclamo: number, idusuario: number){
        const reclamo = await this.reclamoRepo.findOneByOrFail({ id: idreclamo });
        const oldReclamo = { ...reclamo };
        reclamo.idusuarioResponsable = null;
        await this.datasource.transaction(async manager => {
            await manager.save(reclamo);
            await manager.save(Reclamo.getEventoAuditoria(idusuario, 'M', oldReclamo, reclamo));
        });
    }

    async cambiarEstado(idreclamo: number, estado: EstadoReclamoType, idusuario: number ){
        const reclamo = await this.reclamoRepo.findOneByOrFail({id: idreclamo});
        const materialesUtilizados = await this.materialUtilizadoRepo.findBy({idreclamo});

        if(reclamo.estado == estado) throw new HttpException({
            message: `El el estado es el mismo que el actual.`
        }, HttpStatus.BAD_REQUEST);

        const oldReclamo = { ...reclamo };
        reclamo.estado = estado;
        reclamo.fechaHoraCambioEstado = new Date();
        await this.datasource.transaction(async manager => {
            await manager.save(reclamo);
            await manager.save(Reclamo.getEventoAuditoria(idusuario, 'M', oldReclamo, reclamo));
            if(estado != 'FIN' && estado != 'OTR'){
                for(let matUtil of materialesUtilizados){
                    const oldMatUtil = { ...matUtil };
                    matUtil.eliminado = true;
                    await manager.save(matUtil);
                    await manager.save(MaterialUtilizado.getEventoAuditoria(idusuario, 'E', oldMatUtil, matUtil));
                }
            }
        })
    }

    async finalizarReclamo(idreclamo: number, finalizacion: FinalizacionReclamoDTO, idusuario: number){
        const reclamo = await this.reclamoRepo.findOneByOrFail({id: idreclamo});
        const oldReclamo = { ...reclamo };

        if(reclamo.estado != finalizacion.estado) reclamo.fechaHoraCambioEstado = new Date();
        reclamo.estado = <EstadoReclamoType>finalizacion.estado;
        if(reclamo.estado == 'OTR') reclamo.observacionEstado = finalizacion.observacionestado;

        await this.datasource.transaction(async manager => {
            await manager.save(reclamo);
            await manager.save(Reclamo.getEventoAuditoria(idusuario, 'M', oldReclamo, reclamo));

            for(let materialUtilizado of finalizacion.materialesutilizados){
                delete materialUtilizado.id;
                await manager.save(MaterialUtilizado.fromDTO(materialUtilizado));
                await manager.save(MaterialUtilizado.getEventoAuditoria(idusuario, 'R', null, materialUtilizado));
            }
        });
    }

    async editarFinanalizacion(idreclamo: number, finalizacion: FinalizacionReclamoDTO, idusuario: number){
        const reclamo = await this.reclamoRepo.findOneByOrFail({id: idreclamo});
        const oldReclamo = { ...reclamo };

        const oldMaterialesUtilizados = await this.materialUtilizadoRepo.findBy({idreclamo});
        const materialesEliminados = oldMaterialesUtilizados.filter(mu => !finalizacion.materialesutilizados.find(muNew => muNew.id == mu.id));
        const materialesNuevos = finalizacion.materialesutilizados.filter(muNew => !oldMaterialesUtilizados.find(mu => mu.id == muNew.id));
        const materialesPersistentes = oldMaterialesUtilizados.filter(mu => finalizacion.materialesutilizados.find(muNew => muNew.id == mu.id));
        
        if(reclamo.estado != finalizacion.estado) reclamo.fechaHoraCambioEstado = new Date();
        reclamo.estado = <EstadoReclamoType>finalizacion.estado;
        reclamo.observacionEstado = finalizacion.observacionestado;

        await this.datasource.transaction(async manager => {
            await manager.save(reclamo);
            await manager.save(Reclamo.getEventoAuditoria(idusuario, 'M', oldReclamo, reclamo));

            for(let materialUtilizado of materialesEliminados){
                const oldMaterialUtilizado = { ... materialUtilizado };
                materialUtilizado.eliminado = true;
                await manager.save(materialUtilizado);
                await manager.save(MaterialUtilizado.getEventoAuditoria(idusuario, 'E', oldMaterialUtilizado, materialUtilizado));
            }

            for(let materialUtilizadoDto of materialesPersistentes){
                const materialUtilizado = MaterialUtilizado.fromDTO(materialUtilizadoDto);
                const oldMaterialUtilizado = { ...materialUtilizado };
                await manager.save(materialUtilizado);
                await manager.save(MaterialUtilizado.getEventoAuditoria(idusuario, 'M', oldMaterialUtilizado, materialUtilizado));
            }

            for(let materialUtilizadoDto of materialesNuevos){
                const materialUtilizado = MaterialUtilizado.fromDTO(materialUtilizadoDto);
                await manager.save(materialUtilizado);
                await manager.save(MaterialUtilizado.getEventoAuditoria(idusuario, 'R', null, materialUtilizado));
            }
        });
    }

    findMaterialesUtilizados(queries: QueriesType): Promise<MaterialUtilizadoView[]>{
        const alias = 'mu';
        const { idreclamo, eliminado } = queries;
        let query = this.materialUtilizadoViewRepo.createQueryBuilder(alias);
        if(idreclamo) query = query.andWhere(`${alias}.idreclamo = :idreclamo`, {idreclamo});
        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, {eliminado});
        return query.getMany();
    }

}
