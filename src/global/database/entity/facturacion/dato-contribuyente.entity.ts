import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({schema: "facturacion"})
export class DatoContribuyente {

    public static readonly RUC = "ruc";
    public static readonly RAZON_SOCIAL = "razon-social";

    @PrimaryColumn({name: "clave", length: 50})
    clave: string;

    @Column({name: 'valor', length: 150, nullable: false})
    valor: string;
}