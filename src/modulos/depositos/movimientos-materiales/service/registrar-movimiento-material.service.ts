import { DetalleMovimientoMaterial } from '@database/entity/depositos/detalle-movimiento-material.entity';
import { MovimientoMaterial } from '@database/entity/depositos/movimiento-material.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, EntityManager, In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Existencia } from '@database/entity/depositos/existencia.entity';
import { MaterialIdentificable } from '@database/entity/depositos/material-identificable.entity';
import { Usuario } from '@database/entity/usuario.entity';

@Injectable()
export class RegistrarMovimientoMaterial {

    constructor(
        @InjectRepository(Existencia)
        private existenciasRepo: Repository<Existencia>,
        @InjectRepository(MaterialIdentificable)
        private materialesIdentificalbesRepo: Repository<MaterialIdentificable>,
        @InjectRepository(MovimientoMaterial)
        private movimientoRepo: Repository<MovimientoMaterial>,
        private datasource: DataSource
    ){ }

    public async registrar(
        movimiento: MovimientoMaterial,
        detalles: DetalleMovimientoMaterial[],
        idusuario: number
    ): Promise<number>{
        switch(movimiento.tipoMovimiento){
            case 'EN': return await this.registrarEntrada(movimiento, detalles, idusuario);
            case 'SA': return await this.registrarSalida(movimiento, detalles, idusuario);
            case 'DE': return await this.registrarDevolucion(movimiento, detalles, idusuario);
            default: return -1;
        }
    }

    private async registrarMovimientoBase(
        movimiento: MovimientoMaterial,
        detalles: DetalleMovimientoMaterial[],
        idusuario: number,
        manager: EntityManager
    ): Promise<{savedMovimiento: MovimientoMaterial, savedDetalles: DetalleMovimientoMaterial[]}>{
        delete movimiento.id;
        if(movimiento.tipoMovimiento == 'EN' && movimiento.idusuarioEntrega == -1)
            movimiento.idusuarioEntrega = null;
        
        const savedMovimiento = await manager.save(movimiento); 
        await manager.save(MovimientoMaterial.getEventoAuditoria(idusuario, 'R', null, movimiento));
        
        const savedDetalles: DetalleMovimientoMaterial[] = [];
        for(let detalle of detalles){
            delete detalle.id;
            detalle.idmovimientoMaterial = savedMovimiento.id;
            savedDetalles.push(await manager.save(detalle));
            await manager.save(DetalleMovimientoMaterial.getEventoAuditoria(idusuario, 'R', null, detalle));
        }
        return { savedMovimiento, savedDetalles };
    }

    private async actualizarMaterialesIdentificables(
        detalles: DetalleMovimientoMaterial[],
        materialDisponible: boolean,
        manager: EntityManager
    ): Promise<MaterialIdentificable[]>{
        const materialesIdentificables = detalles
            .filter(d => d.nroSerieMaterial != null && Number(d.cantidad) > 0)
            .map(de => {
                return Object.assign(new MaterialIdentificable(), {
                    serial: de.nroSerieMaterial,
                    idmaterial: de.idmaterial,
                    disponible: materialDisponible
                });
            });
        for(let mi of materialesIdentificables) await manager.save(mi);
        return materialesIdentificables;
    }
    
    /**
     * tipo 'sumar' -> entrada de materiales
     * tipo 'restar' -> salida de materiales
     * tipoo 'reemplazar' -> ajuste de stock
     */
    private async actualizarExistencias(
        detalles: DetalleMovimientoMaterial[],
        idusuario: number,
        tipo: 'sumar' | 'restar' | 'reemplazar',
        manager: EntityManager
    ): Promise<Existencia[]>{
        const setIdMateriales = new Set<number>(detalles.map(d => d.idmaterial));
        const existencias = await this.existenciasRepo.findBy({
            idmaterial: In(Array.from(setIdMateriales)),
            iddeposito: 1
        });
        for(let existencia of existencias){
            let cantidadInicial: number = tipo == 'reemplazar' ? 0 : Number(existencia.cantidad);
            let nuevaCantidad = detalles
                .filter(d => d.idmaterial == existencia.idmaterial)
                .reduce((accumulator, currentValue) => {
                    if(tipo == 'restar') return accumulator - Number(currentValue.cantidad)
                    else return accumulator + Number(currentValue.cantidad)
                }, cantidadInicial);
            let oldExistencia = { ...existencia };

            existencia.cantidad = `${nuevaCantidad}`;
            await manager.save(existencia);
            await manager.save(Existencia.getEventoAuditoria(idusuario, 'M', oldExistencia, existencia));
        }
        return existencias;
    }

    private async registrarEntrada(
        movimiento: MovimientoMaterial,
        detalles: DetalleMovimientoMaterial[],
        idusuario: number
    ): Promise<number> {
        let idmovimiento: number = -1;
        await this.datasource.transaction(async manager => {
            await this.actualizarMaterialesIdentificables(detalles, true, manager);
            await this.actualizarExistencias(detalles, idusuario, 'sumar', manager);
            idmovimiento = (await this.registrarMovimientoBase(movimiento, detalles, idusuario, manager)).savedMovimiento.id;
        });
        return idmovimiento;
    }

    private async registrarSalida(
        movimiento: MovimientoMaterial,
        detalles: DetalleMovimientoMaterial[],
        idusuario: number
    ): Promise<number>{
        let idmovimiento = -1;
        await this.datasource.transaction(async manager => {
            await this.actualizarMaterialesIdentificables(detalles, false, manager);
            await this.actualizarExistencias(detalles, idusuario, 'restar', manager);
            idmovimiento = (await this.registrarMovimientoBase(movimiento, detalles, idusuario, manager)).savedMovimiento.id;
        });
        return idmovimiento;
    }

    private async registrarDevolucion(
        movimiento: MovimientoMaterial,
        detalles: DetalleMovimientoMaterial[],
        idusuario: number
    ): Promise<number>{
        console.log('devolucion')
        let idmovimiento = -1;
        if(movimiento.idmovimientoReferencia == null) throw new HttpException({
            message: 'El movimiento de material referenciado no puede ser nulo'
        }, HttpStatus.BAD_REQUEST);
        
        await this.datasource.transaction(async manager => {
            await this.actualizarMaterialesIdentificables(detalles, true, manager);
            await this.actualizarExistencias(detalles, idusuario, 'sumar', manager);

            const { savedMovimiento } = await this.registrarMovimientoBase(movimiento, detalles, idusuario, manager);
            idmovimiento = savedMovimiento.id;
            const oldSavedMovimiento = { ...savedMovimiento };

            const movimientoReferencia = await this.movimientoRepo.findOneByOrFail({id: movimiento.idmovimientoReferencia});
            const oldMovimientoReferencia = { ... movimientoReferencia };

            movimientoReferencia.devuelto = true;
            movimientoReferencia.idmovimientoReferencia = idmovimiento;
            await manager.save(movimientoReferencia);
            await manager.save(MovimientoMaterial.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldMovimientoReferencia, movimientoReferencia));

            savedMovimiento.idmovimientoReferencia = movimientoReferencia.id;
            await manager.save(savedMovimiento);
            await manager.save(MovimientoMaterial.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldSavedMovimiento, savedMovimiento));
        });
        return idmovimiento;
    }

}
