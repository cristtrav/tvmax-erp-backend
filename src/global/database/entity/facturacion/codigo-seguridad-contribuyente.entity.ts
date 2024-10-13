import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({name: 'codigo_seguridad_contribuyente', schema: 'facturacion'})
export class CodigoSeguridadContribuyente{

    @PrimaryColumn()
    id: number;

    @Column({name: 'codigo_seguridad', length: 200, nullable: false})
    codigoSeguridad: string;

    @Column({name: 'activo', nullable: false, default: true})
    activo: boolean;

}