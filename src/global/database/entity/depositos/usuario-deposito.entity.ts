import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

const ROLES_USUARIOS_DEPOSITO = ['PR', 'RE'] as const;
export type RolUsuarioDepositoType = typeof ROLES_USUARIOS_DEPOSITO[number];

@Entity({schema: 'depositos'})
export class UsuarioDeposito {

    @PrimaryGeneratedColumn('identity', { generatedIdentity: 'BY DEFAULT' })
    id: number;

    @Column({name: 'razon_social', length: '80', nullable: false})
    razonSocial: string;

    @Column({type: 'enum', enum: ROLES_USUARIOS_DEPOSITO, nullable: false})
    rol: RolUsuarioDepositoType;

    @Column({nullable: false, default: false})
    eliminado: boolean;

}

