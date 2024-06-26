import { DetalleReclamo } from '@database/entity/reclamos/detalle-reclamo.entity';
import { EventoCambioEstado } from '@database/entity/reclamos/evento-cambio-estado.entity';
import { MaterialUtilizado } from '@database/entity/reclamos/material-utilzado.entity';
import { EstadoReclamoType, Reclamo } from '@database/entity/reclamos/reclamo.entity';
import { TablaAuditoria } from '@database/entity/tabla-auditoria.entity';
import { MaterialUtilizadoView } from '@database/view/reclamos/material-utilizado.view';
import { ReclamoView } from '@database/view/reclamos/reclamo.view';
import { UsuarioView } from '@database/view/usuario.view';
import { DetalleReclamoDTO } from '@dto/reclamos/detalle-reclamo.dto';
import { FinalizacionReclamoDTO } from '@dto/reclamos/finalizacion-reclamo.dto';
import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';

type QueriesType = {[name: string]: any}
type UsuarioType = 'registro' | 'responsable';

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
        @InjectRepository(UsuarioView)
        private usuarioViewRepo: Repository<UsuarioView>,
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
                qb = qb.orWhere(`${alias}.ci = :cisearch`, {cisearch: search});
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

            const evento = new EventoCambioEstado();
            evento.fechaHora = new Date();
            evento.estado = reclamo.estado;
            evento.idreclamo = idreclamo;
            await manager.save(evento);
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
            if(oldReclamo.estado != reclamo.estado){                
                const evento = new EventoCambioEstado();
                evento.fechaHora = new Date();
                evento.estado = reclamo.estado;
                evento.idreclamo = reclamo.id;
                await manager.save(evento);
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
        reclamo.estado = 'ASI';
        await this.datasource.transaction(async manager => {
            await manager.save(reclamo);
            await manager.save(Reclamo.getEventoAuditoria(idusuario, 'M', oldReclamo, reclamo));

            const evento = new EventoCambioEstado();
            evento.estado = reclamo.estado;
            evento.fechaHora = new Date();
            evento.idreclamo = reclamo.id;
            await manager.save(evento);
        });
    }

    async liberarResponsable(idreclamo: number, idusuario: number){
        const reclamo = await this.reclamoRepo.findOneByOrFail({ id: idreclamo });
        const oldReclamo = { ...reclamo };

        reclamo.idusuarioResponsable = null;
        reclamo.estado = 'PEN';
        await this.datasource.transaction(async manager => {
            await manager.save(reclamo);
            await manager.save(Reclamo.getEventoAuditoria(idusuario, 'M', oldReclamo, reclamo));

            const evento = new EventoCambioEstado();
            evento.estado = reclamo.estado;
            evento.fechaHora = new Date();
            evento.idreclamo = reclamo.id;
            await manager.save(evento);
        });
    }

    async cambiarEstado(idreclamo: number, data: {estado: EstadoReclamoType, observacion: string }, idusuario: number ){
        const reclamo = await this.reclamoRepo.findOneByOrFail({id: idreclamo});
        const materialesUtilizados = await this.materialUtilizadoRepo.findBy({idreclamo});

        if(reclamo.estado == data.estado) throw new HttpException({
            message: `El el estado es el mismo que el actual.`
        }, HttpStatus.BAD_REQUEST);

        if(data.estado == 'PRO' && reclamo.estado != 'ASI' && reclamo.estado != 'POS') throw new HttpException({
            message: 'El reclamo no se encuentra asignado'
        }, HttpStatus.BAD_REQUEST);

        if(data.estado == 'POS' && (reclamo.estado == 'FIN' || reclamo.estado == 'OTR')) throw new HttpException({
            message: 'El reclamo está finalizado'
        }, HttpStatus.BAD_REQUEST);

        if(data.estado == 'POS' && reclamo.estado != 'PRO' && reclamo.estado != 'ASI') throw new HttpException({
            message: 'El reclamo no está asignado'
        }, HttpStatus.BAD_REQUEST);    

        const oldReclamo = { ...reclamo };
        reclamo.estado = data.estado;
        reclamo.fechaHoraCambioEstado = new Date();
        if(data.estado == 'POS') reclamo.motivoPostergacion = data.observacion;

        await this.datasource.transaction(async manager => {
            await manager.save(reclamo);
            await manager.save(Reclamo.getEventoAuditoria(idusuario, 'M', oldReclamo, reclamo));
            if(data.estado != 'FIN' && data.estado != 'OTR'){
                for(let matUtil of materialesUtilizados){
                    const oldMatUtil = { ...matUtil };
                    matUtil.eliminado = true;
                    await manager.save(matUtil);
                    await manager.save(MaterialUtilizado.getEventoAuditoria(idusuario, 'E', oldMatUtil, matUtil));
                }
            }
            const evento = new EventoCambioEstado();
            evento.fechaHora = new Date();
            evento.estado = data.estado;
            evento.idreclamo = idreclamo;
            evento.observacion = data.observacion;
            await manager.save(evento);
        })
    }

    async finalizarReclamo(idreclamo: number, finalizacion: FinalizacionReclamoDTO, idusuario: number){
        const reclamo = await this.reclamoRepo.findOneByOrFail({id: idreclamo});
        const oldReclamo = { ...reclamo };

        if(reclamo.estado == 'FIN' || reclamo.estado == 'OTR') throw new HttpException({
            message: 'El reclamo ya está finalizado'
        }, HttpStatus.BAD_REQUEST);

        if(reclamo.estado != 'PRO') throw new HttpException({
            message: 'El reclamo no está en proceso'
        }, HttpStatus.BAD_REQUEST);

        if(reclamo.estado != finalizacion.estado) reclamo.fechaHoraCambioEstado = new Date();
        reclamo.estado = <EstadoReclamoType>finalizacion.estado;
        if(reclamo.estado == 'OTR') reclamo.observacionEstado = finalizacion.observacionestado;
        reclamo.personaRecepcionTecnico = finalizacion.personarecepciontecnico;

        await this.datasource.transaction(async manager => {
            await manager.save(reclamo);
            await manager.save(Reclamo.getEventoAuditoria(idusuario, 'M', oldReclamo, reclamo));

            for(let materialUtilizado of finalizacion.materialesutilizados){
                delete materialUtilizado.id;
                await manager.save(MaterialUtilizado.fromDTO(materialUtilizado));
                await manager.save(MaterialUtilizado.getEventoAuditoria(idusuario, 'R', null, materialUtilizado));
            }

            const evento = new EventoCambioEstado();
            evento.idreclamo = idreclamo;
            evento.fechaHora = new Date();
            evento.estado = reclamo.estado;
            await manager.save(evento);
        });
    }

    async editarFinanalizacion(idreclamo: number, finalizacion: FinalizacionReclamoDTO, idusuario: number){
        const reclamo = await this.reclamoRepo.findOneByOrFail({id: idreclamo});
        const oldReclamo = { ...reclamo };

        if(reclamo.estado != 'FIN' && reclamo.estado != 'OTR') throw new HttpException({
            message: 'El reclamo aún no fue finalizado'
        }, HttpStatus.BAD_REQUEST);

        const oldMaterialesUtilizados = await this.materialUtilizadoRepo.findBy({idreclamo});
        const materialesEliminados = oldMaterialesUtilizados.filter(mu => !finalizacion.materialesutilizados.find(muNew => muNew.id == mu.id));
        const materialesNuevos = finalizacion.materialesutilizados.filter(muNew => !oldMaterialesUtilizados.find(mu => mu.id == muNew.id));
        const materialesPersistentes = oldMaterialesUtilizados.filter(mu => finalizacion.materialesutilizados.find(muNew => muNew.id == mu.id));
        
        if(reclamo.estado != finalizacion.estado) reclamo.fechaHoraCambioEstado = new Date();
        reclamo.estado = <EstadoReclamoType>finalizacion.estado;
        reclamo.observacionEstado = finalizacion.observacionestado;
        reclamo.personaRecepcionTecnico = finalizacion.personarecepciontecnico;

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

    async findUsuarios(queries: QueriesType, tipo: UsuarioType): Promise<UsuarioView[]>{
        const { sort, eliminado } = queries;
        const idsUsuario = await this.getIdsUsuarios(tipo);
        if(idsUsuario.length == 0) return [];
        
        let query =
            this.usuarioViewRepo
            .createQueryBuilder('usuario')
            .where(`usuario.id IN (:...idsUsuario)`, { idsUsuario });

            if(eliminado != null) query = query.andWhere(`usuario.eliminado = :eliminado`, {eliminado});
            if(sort){
                const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) == '-' ? 'DESC' : 'ASC';
                const sortColumn = sort.substring(1);
                query = query.orderBy(`usuario.${sortColumn}`, sortOrder);
                if(sortColumn != 'id') query = query.addOrderBy(`usuario.id`, sortOrder);
            }
        return query.getMany();
    }

    private async getIdsUsuarios(tipo: UsuarioType): Promise<number[]>{
        const idusuarioCol = tipo == 'registro' ? 'idusuarioRegistro' : 'idusuarioResponsable';
        return (await this.reclamoRepo
            .createQueryBuilder('reclamo')
            .select(`reclamo.${idusuarioCol}`)
            .distinctOn([`reclamo.${idusuarioCol}`])
            .where('reclamo.eliminado = FALSE')
            .getMany()
        ).map(reclamo => reclamo[idusuarioCol]);
    }

}
