import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'evento_auditoria'})
export class EventoAuditoria {

    @PrimaryGeneratedColumn('identity', {generatedIdentity: "BY DEFAULT"})
    id: number;

    @Column({
        name: 'fecha_hora',
        type: 'timestamp without time zone'
    })
    fechahora: Date

    @Column()
    idusuario: number;

    @Column({
        name: 'pk_referencia',
        length: 100
    })
    pkreferencia: string;

    @Column()
    idtabla: number;

    @Column({length: 1})
    operacion: 'R' | 'M' | 'E';
    
    @Column({
        name: 'estado_anterior',
        type: 'json'
    })
    estadoanterior: {[param: string]: any};

    @Column({
        name: 'estado_nuevo',
        type: 'json'
    })
    estadonuevo: {[param: string]: any};
}