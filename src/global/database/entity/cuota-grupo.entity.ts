import { Schemas } from "@database/meta/schemas";
import { CuotaGrupoDTO } from "@dto/cuota-grupo.dto";
import { Column, Entity, PrimaryColumn } from "typeorm";
import { Cliente } from "./cliente.entity";
import { EventoAuditoria } from "./evento-auditoria.entity";
import { TablaAuditoria } from "./tabla-auditoria.entity";

@Entity({schema: Schemas.PUBLIC, name: 'cuota_grupo'})
export class CuotaGrupo{

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(42, 'Grupos de Cuotas');

    constructor(cuotaGrupoDto?: CuotaGrupoDTO){
        if(cuotaGrupoDto == null) return;

        this.idsuscripcion = cuotaGrupoDto.idsuscripcion;
        this.idservicio = cuotaGrupoDto.idservicio;
        this.codigo = cuotaGrupoDto.codigo;
        this.activo = cuotaGrupoDto.activo;
        this.totalCuotas = cuotaGrupoDto.totalcuotas;
    }

    @PrimaryColumn()
    idsuscripcion: number;

    @PrimaryColumn()
    codigo: string;

    @PrimaryColumn()
    idservicio: number;

    @Column({nullable: false, default: true})
    activo: boolean;

    @Column({name: 'total_cuotas', nullable: false, default: 0})
    totalCuotas: number;

    toDTO(): CuotaGrupoDTO{
        return {
            idsuscripcion: this.idsuscripcion,
            idservicio: this.idservicio,
            activo: this.activo,
            codigo: this.codigo,
            totalcuotas: this.totalCuotas
        }
    }

    static getEventoAuditoria(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any
    ): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.fechahora = new Date();
        evento.idtabla = CuotaGrupo.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

}