import { Schemas } from "@database/meta/schemas";
import { Column, Entity, PrimaryColumn } from "typeorm";

const TABLE_NAME = 'cliente_tipo'

@Entity({schema: Schemas.PUBLIC, name: TABLE_NAME})
export class ClienteTipo{

    @PrimaryColumn()
    id: string;

    @Column({length: 40, nullable: false})
    descripcion: string;

}