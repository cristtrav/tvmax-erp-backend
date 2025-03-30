import { Schemas } from "@database/meta/schemas";
import { AjusteMaterialIdentificableDTO } from "@dto/depositos/ajuste-material-identificable.dto";
import { Column, Entity, PrimaryColumn } from "typeorm";

const TABLE_NAME = `ajuste_material_identificable`

@Entity({ schema: Schemas.DEPOSITOS, name: TABLE_NAME })
export class AjusteMaterialIdentificable{

    constructor(ajusteIdentificableDto?: AjusteMaterialIdentificableDTO){
        if(ajusteIdentificableDto == null) return;
        
        this.idajusteExistencia = ajusteIdentificableDto.idajusteexistencia;
        this.idmaterial = ajusteIdentificableDto.idmaterial;
        this.serial = ajusteIdentificableDto.serial;
        this.disponibilidadAnterior = ajusteIdentificableDto.disponibilidadanterior;
        this.disponibilidadNueva = ajusteIdentificableDto.disponibilidadnueva;
        this.bajaAnterior = ajusteIdentificableDto.bajaanterior;
        this.bajaNueva = ajusteIdentificableDto.bajanueva;
    }

    @PrimaryColumn({name: 'idajuste_existencia'})
    idajusteExistencia: number;

    @PrimaryColumn()
    idmaterial: number;

    @PrimaryColumn({length: 70})
    serial: string;

    @Column({name: 'disponibilidad_anterior', nullable: false, default: false})
    disponibilidadAnterior: boolean;

    @Column({name: 'disponibilidad_nueva', nullable: false, default: false})
    disponibilidadNueva: boolean;

    @Column({name: 'baja_anterior', nullable: false, default: false})
    bajaAnterior: boolean;

    @Column({name: 'baja_nueva', nullable: false, default: false})
    bajaNueva: boolean;

}