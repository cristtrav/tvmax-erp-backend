import { Schemas } from "@database/meta/schemas";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({schema: Schemas.FACTURACION, name: 'email_desactivado'})
export class EmailDesactivado{

    @PrimaryColumn()
    email: string;

    @Column({name: 'fecha_hora', nullable: false, type: 'timestamp with time zone'})
    fechaHora: Date;

    @Column({type: 'text'})
    motivo: string;

}