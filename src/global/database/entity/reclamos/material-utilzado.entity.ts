import { MaterialUtilizadoDTO } from "@dto/reclamos/material-utilizado.dto";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { MovimientoMaterial } from "../depositos/movimiento-material.entity";

@Entity({schema: 'reclamos'})
export class MaterialUtilizado {

    @PrimaryGeneratedColumn('identity', { generatedIdentity: 'BY DEFAULT' })
    id: number;

    @Column({nullable: false})
    idreclamo: number;

    @Column({nullable: false})
    idmaterial: number;

    @Column({nullable: false, type: 'numeric', precision: 9, scale: 2, default: '0.0'})
    cantidad: string;

    @Column({length: 80})
    descripcion: string;

    @Column({nullable: false, default: false})
    eliminado: boolean;

    static fromDTO(materialUtilizadoDto: MaterialUtilizadoDTO): MaterialUtilizado{
        const materialUtilizado = new MaterialUtilizado();
        if(materialUtilizadoDto.id != null) materialUtilizado.id = materialUtilizadoDto.id;
        materialUtilizado.idreclamo = materialUtilizadoDto.idreclamo;
        materialUtilizado.idmaterial = materialUtilizadoDto.idmaterial;
        materialUtilizado.descripcion = materialUtilizadoDto.descripcion;
        materialUtilizado.cantidad = materialUtilizadoDto.cantidad;
        materialUtilizado.eliminado = materialUtilizadoDto.eliminado;
        return materialUtilizado;
    }

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(31, 'Material Utilizado');

    static getEventoAuditoria(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: MaterialUtilizado | MaterialUtilizadoDTO | null,
        newValue: MaterialUtilizado | MaterialUtilizadoDTO | null
    ): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.fechahora = new Date();
        evento.idtabla = MaterialUtilizado.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

}