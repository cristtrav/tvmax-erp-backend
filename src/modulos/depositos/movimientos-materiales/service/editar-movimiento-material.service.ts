import { DetalleMovimientoMaterial } from '@database/entity/depositos/detalle-movimiento-material.entity';
import { Existencia } from '@database/entity/depositos/existencia.entity';
import { MaterialIdentificable } from '@database/entity/depositos/material-identificable.entity';
import { MovimientoMaterial } from '@database/entity/depositos/movimiento-material.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Not, Repository } from 'typeorm';

@Injectable()
export class EditarMovimientoMaterialService {

    constructor(
        @InjectRepository(MovimientoMaterial)
        private movimientoMaterialRepo: Repository<MovimientoMaterial>,
        @InjectRepository(DetalleMovimientoMaterial)
        private detalleMovimientoRepo: Repository<DetalleMovimientoMaterial>,
        private datasource: DataSource
    ){}

    async editar(
        movimiento: MovimientoMaterial,
        detalles: DetalleMovimientoMaterial[],
        idusuario: number
    ){
        /**
         * Los detalles que cuyo ID sea menor o igual a 1000
         * es considerado como detalle nuevo, es decir agregado.
         */
        detalles = detalles.map(de => {
            de.idmovimientoMaterial = movimiento.id;
            if(de.id == null || de.id <= 1000) delete de.id;
            return de;
        })
        if(movimiento.tipoMovimiento == 'EN') 
            await this.editarEntrada(movimiento, detalles, idusuario);
        else if(movimiento.tipoMovimiento == 'SA')
            await this.editarSalida(movimiento, detalles, idusuario);
        else if(movimiento.tipoMovimiento == 'DE')
            await this.editarDevolucion(movimiento, detalles, idusuario);
        else throw new HttpException({
            message: 'Tipo de movimiento desconocido'
        }, HttpStatus.BAD_REQUEST)
    }

    private async editarMovimientoBase(
        movimiento: MovimientoMaterial,
        oldMovimiento: MovimientoMaterial,
        detalles: DetalleMovimientoMaterial[],
        oldDetalles: DetalleMovimientoMaterial[],
        idusuario: number,
        manager: EntityManager
    ){
        const detallesEliminar = oldDetalles.filter(oldDe => 
            !detalles.some(de => de.idmaterial == oldDe.idmaterial && de.nroSerieMaterial == oldDe.nroSerieMaterial)
        );

        await manager.save(movimiento);
        await manager.save(MovimientoMaterial.getEventoAuditoria(idusuario, 'M', oldMovimiento, movimiento));
        for(let detalle of detalles){
            let detalleGuardado = await manager.save(detalle);
            if(detalle.id == null) await manager.save(DetalleMovimientoMaterial.getEventoAuditoria(idusuario, 'R', null, detalleGuardado));
            else {
                const oldDetalleEditar = oldDetalles.find(oldDe => oldDe.id == detalle.id);
                await manager.save(DetalleMovimientoMaterial.getEventoAuditoria(idusuario, 'M', oldDetalleEditar, detalleGuardado));
            }
        }
        for(let detalleEliminar of detallesEliminar){
            let oldDetalleEliminar = { ...detalleEliminar };
            detalleEliminar.eliminado = true;
            await manager.save(detalleEliminar);
            await manager.save(DetalleMovimientoMaterial.getEventoAuditoria(idusuario, 'E', oldDetalleEliminar, detalleEliminar));
        }
    }

    private async actualizarExistencias(
        detalles: DetalleMovimientoMaterial[],
        oldDetalles: DetalleMovimientoMaterial[],
        tipo: 'entrada' | 'salida',
        manager: EntityManager,
    ){
        const setIdMateriales = new Set<number>(detalles.map(d => d.idmaterial));
        const existencias = await manager.getRepository(Existencia).findBy({
            idmaterial: In(Array.from(setIdMateriales)),
            iddeposito: 1
        });
        for(let existencia of existencias){
            const nuevaCantidad = detalles
                .filter(de => de.idmaterial == existencia.idmaterial)
                .reduce((accumulator, currentValue) => {
                    if(tipo == 'salida') return accumulator - Number(currentValue.cantidad);
                    else return accumulator + Number(currentValue.cantidad);
                }, Number(existencia.cantidad));
            existencia.cantidad = `${nuevaCantidad}`;

            await manager.save(existencia);
        }

        const setOldIdeMateriales = new Set<number>(oldDetalles.map(oldDe => oldDe.idmaterial));
        const oldExistencias = await manager.getRepository(Existencia).findBy({
            idmaterial: In(Array.from(setOldIdeMateriales)),
            iddeposito: 1
        });
        for(let existencia of oldExistencias){
            const nuevaCantidad = oldDetalles
                .filter(de => de.idmaterial == existencia.idmaterial)
                .reduce((accumulator, currentValue) => {
                    if(tipo == 'salida') return accumulator + Number(currentValue.cantidad);
                    else return accumulator - Number(currentValue.cantidad);
                }, Number(existencia.cantidad));
            existencia.cantidad = `${nuevaCantidad}`;

            await manager.save(existencia);
        }
    }

    private async actualizarIdentificables(
        detalles: DetalleMovimientoMaterial[],
        oldDetalles: DetalleMovimientoMaterial[],
        tipo: 'entrada' | 'salida',
        manager: EntityManager
    ){
        const disponible: boolean = tipo == 'entrada'

        const detallesEliminar = oldDetalles.filter(oldDe => 
            !detalles.some(de => de.idmaterial == oldDe.idmaterial && de.nroSerieMaterial == oldDe.nroSerieMaterial)
        );
        const materialesIdentificables = detalles
            .filter(de => de.nroSerieMaterial != null && Number(de.cantidad) > 0)
            .map(d => Object.assign(new MaterialIdentificable(), {
                disponible,
                serial: d.nroSerieMaterial,
                idmaterial: d.idmaterial
            }));
        const materialesIdentificablesEliminar = detallesEliminar
            .filter(deEl => deEl.nroSerieMaterial != null && Number(deEl.cantidad) > 0)
            .map(dEl => Object.assign(new MaterialIdentificable(), {
                disponible: !disponible,
                serial: dEl.nroSerieMaterial,
                idmaterial: dEl.idmaterial
            }))

        for(let mi of materialesIdentificables) await manager.save(mi);
        for(let miEliminar of materialesIdentificablesEliminar) await manager.save(miEliminar);
    }

    private async editarEntrada(
        movimiento: MovimientoMaterial,
        detalles: DetalleMovimientoMaterial[],
        idusuario: number
    ){
        const oldMovimiento = await this.movimientoMaterialRepo.findOneByOrFail({ id: movimiento.id });
        const oldDetalles = await this.detalleMovimientoRepo.findBy({ idmovimientoMaterial: movimiento.id, eliminado: false });

        await this.datasource.transaction(async manager => {
            await this.actualizarExistencias(detalles, oldDetalles, 'entrada', manager);
            await this.actualizarIdentificables(detalles, oldDetalles, 'entrada', manager);
            await this.editarMovimientoBase(movimiento, oldMovimiento, detalles, oldDetalles, idusuario, manager);
        });
    }

    private async editarSalida(
        movimiento: MovimientoMaterial,
        detalles: DetalleMovimientoMaterial[],
        idusuario: number
    ){
        const oldMovimiento = await this.movimientoMaterialRepo.findOneByOrFail({ id: movimiento.id });
        const oldDetalles = await this.detalleMovimientoRepo.findBy({ idmovimientoMaterial: movimiento.id, eliminado: false });

        await this.datasource.transaction(async manager => {
            await this.actualizarExistencias(detalles, oldDetalles, 'salida', manager);
            await this.actualizarIdentificables(detalles, oldDetalles, 'salida', manager);
            await this.editarMovimientoBase(movimiento, oldMovimiento, detalles, oldDetalles, idusuario, manager);
        });
    }

    private async editarDevolucion(
        movimiento: MovimientoMaterial,
        detalles: DetalleMovimientoMaterial[],
        idusuario: number
    ){
        const oldMovimiento = await this.movimientoMaterialRepo.findOneByOrFail({ id: movimiento.id });
        const oldDetalles = await this.detalleMovimientoRepo.findBy({ idmovimientoMaterial: movimiento.id, eliminado: false });

        await this.datasource.transaction(async manager => {
            const detallesIdentificables = detalles.filter(de => de.nroSerieMaterial != null);
            for(let det of detallesIdentificables){
                const matIdentificable = await manager
                    .getRepository(MaterialIdentificable)
                    .findOneByOrFail({
                        idmaterial: det.idmaterial,
                        serial: det.nroSerieMaterial
                    });
                matIdentificable.disponible = Number(det.cantidad) > 0;
                await manager.save(matIdentificable);
            }
            await this.actualizarExistencias(detalles, oldDetalles, 'entrada', manager);
            await this.editarMovimientoBase(movimiento, oldMovimiento, detalles, oldDetalles, idusuario, manager);
        });
    }

}
