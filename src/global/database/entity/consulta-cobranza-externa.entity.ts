import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DetalleConsultaCobranzaExterna } from "./detalle-consulta-cobranza-externa.entity";

@Entity()
export class ConsultaCobranzaExterna{
    
    @PrimaryGeneratedColumn('identity', { generatedIdentity: 'BY DEFAULT'})
    id: number;

    @Column({name: 'cod_servicio', nullable: false, default: '00001'})
    codServicio: '00001';

    @Column({name: 'cod_retorno', nullable: false, default: '000'})
    codRetorno: "000" | "001" | "999";

    @Column({name: 'des_retorno', length: 30})
    desRetorno: string;

    @Column({name: 'nombre_apellido', length: 60})
    nombreApellido: string;

    @Column({name: 'nro_documento', length: 15, nullable: false})
    nroDocumento: string;

    @Column({length: 1, nullable: false, default: '1'})
    moneda: "1" | "2";

    @Column({length: 20, nullable: false})
    usuario: string;

    @OneToMany(() => DetalleConsultaCobranzaExterna, (detalle) => detalle.consulta,{
        cascade: ['insert']
    })
    detalles: DetalleConsultaCobranzaExterna[]
}