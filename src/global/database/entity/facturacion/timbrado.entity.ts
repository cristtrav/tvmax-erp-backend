import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Talonario } from "./talonario.entity";
import { Schemas } from "@database/meta/schemas";

@Entity({schema: Schemas.FACTURACION})
export class Timbrado {

    @PrimaryColumn({name: 'nro_timbrado'})
    nroTimbrado: number;

    @Column({
        name: 'fecha_inicio_vigencia',
        type: 'timestamp with time zone',
        nullable: false
    })
    fechaInicioVigencia: Date;

    @Column({
        name: 'fecha_vencimiento',
        type: 'timestamp with time zone',
        nullable: false
    })
    fechaVencimiento: Date;

    @Column({nullable: false, default: false})
    electronico: boolean;

    @OneToMany(() => Talonario, (talonario) => talonario.timbrado)
    talonarios: Talonario[]
}