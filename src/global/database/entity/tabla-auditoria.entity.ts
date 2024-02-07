import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class TablaAuditoria {
    
    @PrimaryColumn()
    id: number;

    @Column({length: 80, nullable: false})
    descripcion: string;

    initialize(id: number, descripcion: string): TablaAuditoria{
        this.id = id;
        this.descripcion = descripcion;
        return this;
    }

}