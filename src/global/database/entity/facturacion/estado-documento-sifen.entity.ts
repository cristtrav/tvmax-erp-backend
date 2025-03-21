import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({name: 'estado_documento_sifen', schema: 'facturacion'})
export class EstadoDocumentoSifen{

    public static readonly APROBADO = 1;
    public static readonly APROBADO_CON_OBS = 2;
    public static readonly RECHAZADO = 3;
    public static readonly CANCELADO = 4;
    public static readonly NO_ENVIADO = 30;
    public static readonly ENVIADO = 32;

    @PrimaryColumn()
    id: number;

    @Column({length: 80, nullable: false})
    descripcion: string;

}