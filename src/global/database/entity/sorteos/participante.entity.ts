import { Entity, PrimaryColumn, Unique } from "typeorm";

@Entity({schema: 'sorteos'})
@Unique('pk_participante_sorteo', ['idsorteo', 'idcliente'])
export class Participante {

    @PrimaryColumn()
    idcliente: number;

    @PrimaryColumn()
    idsorteo: number;

}