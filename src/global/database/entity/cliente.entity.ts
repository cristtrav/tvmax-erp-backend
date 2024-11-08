import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Suscripcion } from "./suscripcion.entity";
import { Venta } from "./venta.entity";
import { TablaAuditoria } from "./tabla-auditoria.entity";
import { ClienteDTO } from "@dto/cliente.dto";
import { EventoAuditoria } from "./evento-auditoria.entity";

@Entity()
export class Cliente{

    static readonly TABLA_AUDITORIA = new TablaAuditoria().initialize(13, 'Clientes');

    @PrimaryColumn()
    id: number;

    @Column({length: 80})
    nombres: string;

    @Column({length: 80})
    apellidos: string;

    @Column({name: 'razon_social',length: 160, nullable: false})
    razonSocial: string;

    @Column({length: 20})
    telefono1: string;

    @Column({length: 20})
    telefono2: string;

    @Column({length: 120})
    email: string;

    @Column({nullable: false})
    idcobrador: number;

    @Column({length: 15})
    ci: string;

    @Column({name: 'dv_ruc'})
    dvRuc: number;

    @Column({default: false, nullable: false})
    eliminado: boolean;

    @Column({name: 'excluido_sorteo', default: false, nullable: false})
    excluidoSorteo: boolean;

    @OneToMany(() => Suscripcion, (suscripcion) => suscripcion.cliente)
    suscripciones: Suscripcion[];

    @OneToMany(() => Venta, (venta) => venta.cliente)
    ventas: Venta[];

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
        evento.idtabla = Cliente.TABLA_AUDITORIA.id;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

    public fromDTO(clienteDto: ClienteDTO): Cliente {
        this.id = clienteDto.id;
        this.nombres = clienteDto.nombres;
        this.apellidos = clienteDto.apellidos;
        this.razonSocial = clienteDto.razonsocial;
        this.telefono1 = clienteDto.telefono1;
        this.telefono2 = clienteDto.telefono2;
        this.email = clienteDto.email;
        this.idcobrador = clienteDto.idcobrador;
        this.dvRuc = clienteDto.dvruc;
        this.ci = clienteDto.ci;
        if(clienteDto.eliminado != null) this.eliminado = clienteDto.eliminado;
        if(clienteDto.excluidosorteo != null) this.excluidoSorteo = clienteDto.excluidosorteo;
        return this;
    }
}