import { DetalleMovimientoMaterial } from '@database/entity/depositos/detalle-movimiento-material.entity';
import { Existencia } from '@database/entity/depositos/existencia.entity';
import { MaterialIdentificable } from '@database/entity/depositos/material-identificable.entity';
import { Material } from '@database/entity/depositos/material.entity';
import { MovimientoMaterial } from '@database/entity/depositos/movimiento-material.entity';
import { MovimientoMaterialView } from '@database/view/depositos/movimiento-material.view';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class MovimientosMaterialesService {

    constructor(
        @InjectRepository(MovimientoMaterial)
        private movimientoMaterialRepo: Repository<MovimientoMaterial>,
        @InjectRepository(Existencia)
        private existenciaRepo: Repository<Existencia>,
        @InjectRepository(MovimientoMaterialView)
        private movimientoMaterialViewRepo: Repository<MovimientoMaterialView>,
        @InjectRepository(DetalleMovimientoMaterial)
        private detalleMovimientoMaterialRepo: Repository<DetalleMovimientoMaterial>,
        @InjectRepository(Material)
        private materialRepo: Repository<Material>,
        @InjectRepository(MaterialIdentificable)
        private materialIdentificableRepo: Repository<MaterialIdentificable>,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: {[name: string]: any}): SelectQueryBuilder<MovimientoMaterialView>{
        const {
            sort,
            offset,
            limit,
            eliminado,
            fechainicio,
            fechafin,
            tipomovimiento,
            idusuarioresponsable
        } = queries;
        const alias = 'movimiento';
        let query = this.movimientoMaterialViewRepo.createQueryBuilder(alias);

        if(eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if(fechainicio) query = query.andWhere(`${alias}.fecha >= :fechainicio`, {fechainicio});
        if(fechafin) query = query.andWhere(`${alias}.fecha <= :fechafin`, {fechafin});
        if(tipomovimiento)
            if(Array.isArray(tipomovimiento)) query = query.andWhere(`${alias}.tipomovimiento IN (:...tipomovimiento)`, {tipomovimiento});
            else query = query.andWhere(`${alias}.tipomovimiento = :tipomovimiento`, {tipomovimiento});
        if(idusuarioresponsable != null) query = query.andWhere(`${alias}.idusuarioresponsable = :idusuarioresponsable`, {idusuarioresponsable});

        if(offset) query = query.skip(offset);
        if(limit) query = query.take(limit);
        if(sort){
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            const sortColumn = sort.substring(1);
            query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
            if(sortColumn !== 'id') query = query.addOrderBy(`${alias}.id`, sortOrder);
        }
        return query;
    }

    findAll(queries: {[name: string]: any}): Promise<MovimientoMaterialView[]>{
        return this.getSelectQuery(queries).getMany();
    }

    count(queries: {[name: string]: any}): Promise<number>{
        return this.getSelectQuery(queries).getCount();
    }

    findById(id: number): Promise<MovimientoMaterialView>{
        return this.movimientoMaterialViewRepo.findOneByOrFail({ id });
    }

    async create(movimiento: MovimientoMaterial, detalles: DetalleMovimientoMaterial[], idusuario: number): Promise<number>{
        let idmovimiento = -1;
        delete movimiento.id;
        if(movimiento.tipoMovimiento == 'AJ') movimiento.idusuarioEntrega = null;
        
        await this.datasource.transaction(async manager => {
            movimiento.devuelto = false;
            idmovimiento = (await manager.save(movimiento)).id;
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaMovimientoMaterial(idusuario, 'R', null, movimiento));

            if(movimiento.tipoMovimiento == 'DE'){
                const movimientoReferencia = await this.movimientoMaterialRepo.findOneByOrFail({id: movimiento.idmovimientoReferencia});
                const oldMovimientoReferencia = {...movimientoReferencia};
                movimientoReferencia.devuelto = true;
                movimientoReferencia.idmovimientoReferencia = idmovimiento;
                await manager.save(movimientoReferencia);
                await manager.save(EventoAuditoriaUtil.getEventoAuditoriaMovimientoMaterial(3, 'M', oldMovimientoReferencia, movimientoReferencia));
            }            
            const setIdMateriales = new Set<number>(detalles.map(d => d.idmaterial));
            const mapCantidadesDetalles = this.getMapCantidadesDetalles(detalles);
            
            const existencias = await this.getExistencias(setIdMateriales);
            const oldExistencias = existencias.map(e => { return {...e}});
            
            const materialesIdentificables = await this.getMaterialesIdentificables(detalles);

            this.agregarMaterialesIdentificablesFaltantes(movimiento.tipoMovimiento, detalles, materialesIdentificables);
            
            this.actualizarExistencias(existencias, mapCantidadesDetalles, movimiento.tipoMovimiento, detalles);
            this.actualizarMaterialesIdentificables(materialesIdentificables, detalles, movimiento.tipoMovimiento);
            
            this.guardarExistencias(oldExistencias, existencias, manager, idusuario);
            for(let materialIdent of materialesIdentificables) await manager.save(materialIdent);

            for(let detalle of detalles){
                const material = await this.materialRepo.findOneByOrFail({id: detalle.idmaterial});
                if(
                    material.identificable &&
                    movimiento.tipoMovimiento == 'SA' &&
                    (await this.materialIdentificableRepo.findOneBy({serial: detalle.nroSerieMaterial, disponible: true})) == null
                ) throw new HttpException({
                    message: `No se encuentra el nro. de serie «${detalle.nroSerieMaterial}» para el material «${material.descripcion}».`
                }, HttpStatus.BAD_REQUEST);

                delete detalle.id
                detalle.movimiento = movimiento;
                const iddetalle = (await manager.save(detalle)).id;

                if(movimiento.tipoMovimiento == 'DE'){
                    const detalleReferencia = await this.detalleMovimientoMaterialRepo.findOneByOrFail({id: detalle.iddetalleMovimientoReferencia});
                    const oldDetalleReferencia = {...detalleReferencia};
                    detalleReferencia.iddetalleMovimientoReferencia = iddetalle;
                    await manager.save(detalleReferencia);
                    await manager.save(EventoAuditoriaUtil.getEventoAuditoriaDetalleMovimientoMaterial(3, 'M', oldDetalleReferencia, detalleReferencia));
                }
            }
        });
        return idmovimiento;
    }

    async update(movimiento: MovimientoMaterial, detalles: DetalleMovimientoMaterial[], idusuario: number){
        const oldMovimiento = await this.movimientoMaterialRepo.findOneByOrFail({id: movimiento.id});
        if(movimiento.tipoMovimiento == 'AJ') delete movimiento.idusuarioEntrega;

        const oldDetalles = await this.detalleMovimientoMaterialRepo.findBy({idmovimientoMaterial: movimiento.id, eliminado: false});
        this.eliminarIdDetallesNuevos(oldDetalles, detalles);
        const setIdMateriales = new Set<number>(
            detalles.map(d => d.idmaterial).concat(oldDetalles.map(d => d.idmaterial))
        );
        
        const mapCantidadesOldDetalles = this.getMapCantidadesDetalles(oldDetalles);
        const mapCantidadesDetalles = this.getMapCantidadesDetalles(detalles);

        const existencias = await this.getExistencias(setIdMateriales)
        const oldExistencias = existencias.map(exi => { return {...exi} });

        const materialesIdentificables = await this.getMaterialesIdentificables(
            detalles.concat(this.getDiferenciaOldDetallesMovimientos(detalles, oldDetalles))
        )

        this.agregarMaterialesIdentificablesFaltantes(movimiento.tipoMovimiento, detalles, materialesIdentificables);

        this.actualizarExistencias(existencias, mapCantidadesOldDetalles, movimiento.tipoMovimiento, oldDetalles, true);
        this.actualizarMaterialesIdentificables(materialesIdentificables, oldDetalles, movimiento.tipoMovimiento, true);
        
        this.actualizarExistencias(existencias, mapCantidadesDetalles, movimiento.tipoMovimiento, detalles);
        this.actualizarMaterialesIdentificables(materialesIdentificables, detalles, movimiento.tipoMovimiento);   

        await this.datasource.transaction(async manager => {
            await manager.save(movimiento);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaMovimientoMaterial(idusuario, 'M', oldMovimiento, movimiento));

            this.guardarExistencias(oldExistencias, existencias, manager, idusuario);
            for(let materialIdent of materialesIdentificables) await manager.save(materialIdent);
            
            await this.eliminarDetallesSobrantes(detalles, oldDetalles, manager, idusuario);

            for(let detalle of detalles){
                detalle.idmovimientoMaterial = movimiento.id;
                await manager.save(detalle);
                await manager.save(EventoAuditoriaUtil.getEventoAuditoriaDetalleMovimientoMaterial(
                    idusuario,
                    'M',
                    oldDetalles.find(od => od.id == detalle.id),
                    detalle
                ));
            }
        })
    }

    async delete(id: number, idusuario: number){
        const movimiento = await this.movimientoMaterialRepo.findOneBy({id, eliminado: false});
        const detalles = await this.detalleMovimientoMaterialRepo.findBy({idmovimientoMaterial: id, eliminado: false});

        if(!movimiento) throw new HttpException({
            message: `No se encontró el movimiento de material con código «${movimiento.id}».`
        }, HttpStatus.NOT_FOUND);

        await this.datasource.transaction(async manager => {
            if(movimiento.idmovimientoReferencia != null){
                const movimientoReferencia = await this.movimientoMaterialRepo.findOneByOrFail({id: movimiento.idmovimientoReferencia});
                movimientoReferencia.idmovimientoReferencia = null;
                movimientoReferencia.devuelto = false;
                await manager.save(movimientoReferencia);
            }

            movimiento.eliminado = true;
            await manager.save(movimiento);

            const setIdMateriales = new Set<number>(detalles.map(d => d.idmaterial));
            const mapIdmaterialesCantidades = this.getMapCantidadesDetalles(detalles);

            const existencias = await this.getExistencias(setIdMateriales);
            const oldExistencias = existencias.map(e => { return {...e} });

            const materialesIdentificables = await this.getMaterialesIdentificables(detalles);

            this.actualizarExistencias(existencias, mapIdmaterialesCantidades, movimiento.tipoMovimiento, detalles, true);
            this.actualizarMaterialesIdentificables(materialesIdentificables, detalles, movimiento.tipoMovimiento, true);

            this.guardarExistencias(oldExistencias, existencias, manager, idusuario);
            for(let identificable of materialesIdentificables) await manager.save(identificable);

            for(let detalle of detalles){                
                if(detalle.iddetalleMovimientoReferencia != null){
                    const detalleReferencia = await this.detalleMovimientoMaterialRepo.findOneByOrFail({id: detalle.iddetalleMovimientoReferencia});
                    detalleReferencia.iddetalleMovimientoReferencia = null;
                    await manager.save(detalleReferencia);
                }
                detalle.eliminado = true;
                await manager.save(detalle);
            }
        });
    }

    async getLastId(queries: {[name: string]: any}): Promise<number>{
        const { eliminado } = queries;
        let query =
            this.movimientoMaterialRepo
            .createQueryBuilder('movimiento')
            .select('MAX(movimiento.id)', 'lastid');
        if(eliminado != null) query = query.andWhere(`movimiento.eliminado = :eliminado`, { eliminado });
        return (await query.getRawOne()).lastid;
    }

    private async getMaterialesIdentificables(detalles: DetalleMovimientoMaterial[]): Promise<MaterialIdentificable[]>{
        return this.materialIdentificableRepo
            .createQueryBuilder('identificable')
            .whereInIds(detalles
                .filter(d => d.nroSerieMaterial != null)
                .map(df => {return {idmaterial: df.idmaterial, serial: df.nroSerieMaterial}})
            ).getMany();
    }

    private async getExistencias(setIdMateriales: Set<number>): Promise<Existencia[]>{
        return this.existenciaRepo
            .createQueryBuilder('existencia')
            .whereInIds([...setIdMateriales].map(idm => { return {idmaterial: idm, iddeposito: 1}}))                
            .getMany();
    }

    private getMapCantidadesDetalles(detalles: DetalleMovimientoMaterial[]): Map<number, number>{
        const mapCantidadesDetalles = new Map<number, number>();
        detalles.forEach(d => 
            mapCantidadesDetalles.set(
                d.idmaterial,
                (mapCantidadesDetalles.get(d.idmaterial) ?? 0) + (Number(d.cantidad))
            )
        );
        return mapCantidadesDetalles; 
    }

    private async guardarExistencias(
        oldExistencias: Existencia[],
        existencias: Existencia[],
        manager: EntityManager,
        idusuario: number
    ){
        for(let existencia of existencias){
            const existenciaAnt = oldExistencias.find(oe => oe.idmaterial == existencia.idmaterial);                
            if(existenciaAnt.cantidad != existencia.cantidad){
                await manager.save(existencia);
                await manager.save(EventoAuditoriaUtil.getEventoAuditoriaExistencia(idusuario, 'M', existenciaAnt, existencia));
            }
        }
    }

    private actualizarExistencias(
        existencias: Existencia[],
        mapMaterialCantidad: Map<number, number>,
        tipoMovimiento: string,
        detalles: DetalleMovimientoMaterial[],
        operacionInversa: boolean = false
    ){
        for(let idmaterial of mapMaterialCantidad.keys()){
            const existencia = existencias.find(ex => ex.idmaterial == idmaterial);
            if(existencia){
                if(tipoMovimiento == 'EN' || tipoMovimiento == 'DE'){
                    if(operacionInversa) existencia.cantidad = `${Number(existencia.cantidad) - (mapMaterialCantidad.get(idmaterial) ?? 0)}`;
                    else existencia.cantidad = `${Number(existencia.cantidad) + (mapMaterialCantidad.get(idmaterial) ?? 0)}`;
                } else if(existencia && tipoMovimiento == 'SA'){
                    if(operacionInversa) existencia.cantidad = `${Number(existencia.cantidad) + (mapMaterialCantidad.get(idmaterial) ?? 0)}`;
                    else existencia.cantidad = `${Number(existencia.cantidad) - (mapMaterialCantidad.get(idmaterial) ?? 0)}`;
                } else if(existencia && tipoMovimiento == 'AJ'){
                    if(operacionInversa) existencia.cantidad = detalles.find(d => d.idmaterial == idmaterial).cantidadAnterior ?? existencia.cantidad;
                    else existencia.cantidad = detalles.find(d => d.idmaterial == idmaterial).cantidad ?? existencia.cantidad;
                }
            }
        }
    }

    private actualizarMaterialesIdentificables(
        materialesIdentificables: MaterialIdentificable[],
        detalles: DetalleMovimientoMaterial[],
        tipoMovimiento: string,
        operacionInversa: boolean = false
    ){
        for(let detalle of detalles.filter(de => de.nroSerieMaterial != null)){
            const matIdent = materialesIdentificables.find(mi => mi.serial == detalle.nroSerieMaterial && mi.idmaterial == detalle.idmaterial);
            if(matIdent){
                if(tipoMovimiento == 'EN' || tipoMovimiento == 'DE'){
                    if(Number(detalle.cantidad) != 0){
                        if(operacionInversa) matIdent.disponible = false;
                        else matIdent.disponible = true;
                    }
                } else if(tipoMovimiento == 'SA'){
                    if(operacionInversa) matIdent.disponible = true;
                    else matIdent.disponible = false;
                } else if(tipoMovimiento == 'AJ'){
                    if(operacionInversa) matIdent.disponible = false;
                    else matIdent.disponible = true;
                }
            }
        }
    }

    private agregarMaterialesIdentificablesFaltantes(
        tipoMovimiento: string,
        detalles: DetalleMovimientoMaterial[],
        identificables: MaterialIdentificable[]
    ){
        const detallesFaltantes = detalles.filter(d => d.nroSerieMaterial && !(identificables.some(i => i.idmaterial == d.idmaterial && i.serial == d.nroSerieMaterial)));
        for(let df of detallesFaltantes){
            const identificable = new MaterialIdentificable();
            identificable.serial = df.nroSerieMaterial;
            identificable.idmaterial = df.idmaterial;            
            if(tipoMovimiento == 'SA') identificable.disponible = false;
            else identificable.disponible = true;
            identificables.push(identificable);
        }
    }

    private eliminarIdDetallesNuevos(oldDetalles: DetalleMovimientoMaterial[], detalles: DetalleMovimientoMaterial[]){
        const detallesLimpar = detalles.filter(d => !(oldDetalles.some(od => od.id == d.id)));
        for(let dl of detallesLimpar) delete dl.id;
    }

    private async eliminarDetallesSobrantes(
        detalles: DetalleMovimientoMaterial[],
        oldDetalles: DetalleMovimientoMaterial[],
        manager: EntityManager,
        idusuario: number
    ) {
        const detallesEliminar = this.getDiferenciaOldDetallesMovimientos(detalles, oldDetalles);
        for(let de of detallesEliminar){
            const oldDe = {...de};
            de.eliminado = true;
            await manager.save(de);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaDetalleMovimientoMaterial(idusuario, 'E', oldDe, de));
        }
    }

    private getDiferenciaOldDetallesMovimientos(
        detalles: DetalleMovimientoMaterial[],
        oldDetalles: DetalleMovimientoMaterial[]
    ): DetalleMovimientoMaterial[]{
        return oldDetalles.filter(da => !detalles.some(dn => dn.id == da.id));
    }
}