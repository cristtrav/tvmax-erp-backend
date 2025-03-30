import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MovimientoMaterial } from '@database/entity/depositos/movimiento-material.entity';
import { DetalleMovimientoMaterial } from '@database/entity/depositos/detalle-movimiento-material.entity';
import { Existencia } from '@database/entity/depositos/existencia.entity';
import { Usuario } from '@database/entity/usuario.entity';
import { MaterialIdentificable } from '@database/entity/depositos/material-identificable.entity';

@Injectable()
export class EliminarMovimientoMaterialService {

    constructor(
        @InjectRepository(MovimientoMaterial)
        private movimientoMaterialRepo: Repository<MovimientoMaterial>,
        @InjectRepository(DetalleMovimientoMaterial)
        private detallesMovimientosRepo: Repository<DetalleMovimientoMaterial>,
        @InjectRepository(Existencia)
        private exitenciasRepo: Repository<Existencia>,
        private datasource: DataSource
    ){}

    public async eliminar(id: number, idusuario: number){
        const movimiento = await this.movimientoMaterialRepo.findOneByOrFail({id, eliminado: false});
        const detalles = await this.detallesMovimientosRepo.findBy({idmovimientoMaterial: id, eliminado: false});

        if(movimiento.tipoMovimiento == 'EN') await this.eliminarEntrada(movimiento, detalles, idusuario);
        else if(movimiento.tipoMovimiento == 'SA') await this.eliminarSalida(movimiento, detalles, idusuario);
        else await this.eliminarDevolucion(movimiento, detalles, idusuario);
    }

    private async eliminarMovimientoBase(
        movimiento: MovimientoMaterial,
        idusuario: number,
        manager: EntityManager
    ){
        const oldMovimiento = { ...movimiento };
        movimiento.eliminado = true;
        await manager.save(movimiento);
        await manager.save(MovimientoMaterial.getEventoAuditoria(idusuario, 'E', oldMovimiento, movimiento));
    }

    private async actualizarExistencias(
        detalles: DetalleMovimientoMaterial[],
        tipo: 'sumar' | 'restar' | 'reemplazar',
        manager: EntityManager
    ){
        const setIdMateriales = new Set<number>(detalles.map(d => d.idmaterial));
        const existencias = await this.exitenciasRepo.findBy({
            iddeposito: 1,
            idmaterial: In(Array.from(setIdMateriales))
        });

        for(let existencia of existencias){
            let cantidadInicial: number = tipo == 'reemplazar' ? 0 : Number(existencia.cantidad);
            const nuevaCantidad = detalles
                .filter(d => d.idmaterial == existencia.idmaterial)
                .reduce((accumulator, currentValue) => {
                    if(tipo == 'restar') return accumulator - Number(currentValue.cantidad);
                    else return accumulator + Number(currentValue.cantidad)
                }, cantidadInicial);

            const oldExistencia = { ...existencia };

            existencia.cantidad = `${nuevaCantidad}`;
            await manager.save(existencia);
            await manager.save(Existencia.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldExistencia, existencia));
        }
    }

    private async actualizarMaterialesIdentificables(
        detalles: DetalleMovimientoMaterial[],
        materialDisponible: boolean,
        manager: EntityManager
    ){
        const materialesIdentificables: MaterialIdentificable[] = detalles
            .filter(d => d.nroSerieMaterial != null && Number(d.cantidad) > 0)
            .map(de => Object.assign(new MaterialIdentificable(), {
                disponible: materialDisponible,
                idmaterial: de.idmaterial,
                serial: de.nroSerieMaterial
            }));
            for(let mi of materialesIdentificables) await manager.save(mi);
    }

    private async eliminarEntrada(
        movimiento: MovimientoMaterial,
        detalles: DetalleMovimientoMaterial[],
        idusuario: number
    ){
        await this.datasource.transaction(async manager => {
            await this.actualizarMaterialesIdentificables(detalles, false, manager);
            await this.actualizarExistencias(detalles, 'restar', manager);
            await this.eliminarMovimientoBase(movimiento, idusuario, manager);
        });
    }

    private async eliminarSalida(
        movimiento: MovimientoMaterial,
        detalles: DetalleMovimientoMaterial[],
        idusuario: number
    ){
        await this.datasource.transaction(async manager => {
            await this.actualizarMaterialesIdentificables(detalles, true, manager);
            await this.actualizarExistencias(detalles, 'sumar', manager);
            await this.eliminarMovimientoBase(movimiento, idusuario, manager);
        });
    }

    private async eliminarDevolucion(
        movimiento: MovimientoMaterial,
        detalles: DetalleMovimientoMaterial[],
        idusuario: number
    ){
        await this.datasource.transaction(async manager => {
            await this.actualizarMaterialesIdentificables(detalles, false, manager);
            await this.actualizarExistencias(detalles, 'restar', manager);
            await this.eliminarMovimientoBase(movimiento, idusuario, manager);

            const movimientoReferencia = await this.movimientoMaterialRepo.findOneByOrFail({id: movimiento.idmovimientoReferencia});
            const oldMovimientoReferencia = { ...movimientoReferencia };
            movimientoReferencia.idmovimientoReferencia = null;
            movimientoReferencia.devuelto = false;
            await manager.save(movimientoReferencia);
            await manager.save(MovimientoMaterial.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldMovimientoReferencia, movimientoReferencia));
        });
        
    }
}
