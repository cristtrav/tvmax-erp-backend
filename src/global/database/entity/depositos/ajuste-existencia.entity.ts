import { Schemas } from "@database/meta/schemas";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { AjusteExistenciaDTO } from "@dto/depositos/ajuste-existencia.dto";

const TABLE_NAME = `ajuste_existencia`

@Entity({ schema: Schemas.DEPOSITOS, name: TABLE_NAME })
export class AjusteExistencia {

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(43, 'Ajustes de existencias de materiales');

    constructor(ajusteDto?: AjusteExistenciaDTO){
        if(ajusteDto != null){
            this.id = ajusteDto.id;
            this.fechaHora = new Date(ajusteDto.fechahora);
            this.idmaterial = ajusteDto.idmaterial;
            this.cantidadAnterior = ajusteDto.cantidadanterior;
            this.cantidadNueva = ajusteDto.cantidadnueva;
            this.idusuario = ajusteDto.idusuario;
            this.eliminado = ajusteDto.eliminado;
        }
    }

    @PrimaryGeneratedColumn('identity', { generatedIdentity: 'BY DEFAULT'})
    id: number;

    @Column({name: 'fecha_hora', nullable: false, type: 'timestamp with time zone'})
    fechaHora: Date;

    @Column({nullable: false})
    idmaterial: number;

    @Column({
        name: 'cantidad_anterior',
        nullable: false,
        type: 'numeric',
        scale: 9,
        precision: 2
    })
    cantidadAnterior: string;

    @Column({
        name: 'cantidad_nueva',
        nullable: false,
        type: 'numeric',
        scale: 9,
        precision: 2
    })
    cantidadNueva: string;

    @Column({nullable: false})
    idusuario: number;

    @Column({nullable: false, default: false})
    eliminado: boolean;

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
        evento.idtabla = AjusteExistencia.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

}