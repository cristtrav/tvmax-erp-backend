import { MigrationInterface, QueryRunner } from "typeorm";

export class ModulosFuncionalidadesTributacion1728840750657 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE public.modulo SET descripcion = 'Exportar CSV' WHERE modulo.id = 35`);
        
        await queryRunner.query(`INSERT INTO public.modulo(id, descripcion, eliminado) VALUES(36, 'Datos de Contribuyente', false)`);
        await queryRunner.query(`INSERT INTO public.modulo(id, descripcion, eliminado) VALUES(37, 'Actividades Económicas', false)`);
        await queryRunner.query(`INSERT INTO public.modulo(id, descripcion, eliminado) VALUES(38, 'Establecimientos', false)`);
        await queryRunner.query(`INSERT INTO public.modulo(id, descripcion, eliminado) VALUES(39, 'Código de Seguridad del Contribuyente', false)`);

        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1020, 36, 'Acceso al Módulo', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1021, 36, 'Consultar', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1022, 36, 'Modificar', false)`);

        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1060, 37, 'Acceso al Módulo', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1061, 37, 'Consultar', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1062, 37, 'Registrar', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1063, 37, 'Editar', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1064, 37, 'Eliminar', false)`);

        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1100, 38, 'Acceso al Módulo', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1101, 38, 'Consultar', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1102, 38, 'Registrar', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1103, 38, 'Editar', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1104, 38, 'Eliminar', false)`);

        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1140, 39, 'Acceso al Módulo', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1141, 39, 'Consultar', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1142, 39, 'Registrar', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1143, 39, 'Editar', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, idmodulo, nombre, eliminado) VALUES(1144, 39, 'Eliminar', false)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const idmodulos = [36, 37, 38, 39];
        const idfuncionalidades = [1020, 1021, 1022, 1060, 1061, 1062, 1063, 1064, 1100, 1101, 1102, 1103, 1104, 1140, 1141, 1142, 1143, 1144];
        
        await queryRunner.query(`UPDATE public.modulo SET descripcion = 'Tributación' WHERE modulo.id = 35`);
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad IN (${idfuncionalidades.join(',')})`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id IN (${idfuncionalidades.join(',')})`);
        await queryRunner.query(`DELETE FROM public.modulo WHERE id IN (${idmodulos.join(',')})`);
    }

}
