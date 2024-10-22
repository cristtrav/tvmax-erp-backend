import { Column, Entity, PrimaryColumn } from "typeorm";
import { TablaAuditoria } from "../tabla-auditoria.entity";
import { EventoAuditoria } from "../evento-auditoria.entity";
import { EstablecimientoDTO } from "@dto/facturacion/establecimiento.dto";

@Entity({schema: "facturacion"})
export class Establecimiento {

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(35, 'Establecimientos');

    @PrimaryColumn({type: "smallint"})
    id: number;

    @Column({name: "denominacion", length: 60, nullable: false})
    denominacion: string;

    @Column({name: "direccion", length: 150, nullable: false})
    direccion: string;

    @Column({name: "nro_casa", nullable: false})
    nroCasa: number;

    @Column({name: "cod_departamento", nullable: false})
    codDepartamento: number;

    @Column({name: "departamento", length: 60, nullable: false})
    departamento: string;

    @Column({name: "cod_distrito", nullable: false})
    codDistrito: number;

    @Column({name: "distrito", length: 80, nullable: false})
    distrito: string;

    @Column({name: "cod_ciudad", nullable: false})
    codCiudad: number;

    @Column({name: "ciudad", length: 80, nullable: false})
    ciudad: string;

    @Column({name: "telefono", length: 20, nullable: false})
    telefono: string;

    @Column({name: "email", length: 100, nullable: false})
    email: string;

    static getEventoAuditoria(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: Establecimiento | EstablecimientoDTO | null,
        newValue: Establecimiento | EstablecimientoDTO |null
    ): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.fechahora = new Date();
        evento.idtabla = Establecimiento.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

    fromDTO(establecimientoDto: EstablecimientoDTO): Establecimiento{
        this.id = establecimientoDto.id;
        this.denominacion = establecimientoDto.denominacion;
        this.direccion = establecimientoDto.direccion;
        this.nroCasa = establecimientoDto.nrocasa;
        this.codDepartamento = establecimientoDto.coddepartamento;
        this.departamento = establecimientoDto.departamento;
        this.codDistrito = establecimientoDto.coddistrito;
        this.distrito = establecimientoDto.distrito;
        this.codCiudad = establecimientoDto.codciudad;
        this.ciudad = establecimientoDto.ciudad;
        this.telefono = establecimientoDto.telefono;
        this.email = establecimientoDto.email;
        return this;
    }

    toDTO(): EstablecimientoDTO{
        return {
            id: this.id,
            denominacion: this.denominacion,
            direccion: this.direccion,
            nrocasa: this.nroCasa,
            coddepartamento: this.codDepartamento,
            departamento: this.departamento,
            coddistrito: this.codDistrito,
            distrito: this.distrito,
            codciudad: this.codCiudad,
            ciudad: this.ciudad,
            telefono: this.telefono,
            email: this.email
        }
    }
}