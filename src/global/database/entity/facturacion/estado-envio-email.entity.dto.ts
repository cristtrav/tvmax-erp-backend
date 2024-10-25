import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({schema: 'facturacion'})
export class EstadoEnvioEmail {

    public static readonly NO_ENVIADO = 1;
    public static readonly ENVIADO = 2;
    public static readonly ENVIO_FALLIDO = 3;
    
    @PrimaryColumn()
    id: number;

    @Column({nullable: false})
    descripcion: string;

}