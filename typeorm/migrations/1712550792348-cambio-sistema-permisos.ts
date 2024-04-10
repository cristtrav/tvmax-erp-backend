import { MigrationInterface, QueryRunner } from "typeorm";

export class CambioSistemaPermisos1712550792348 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO public.modulo(id, descripcion, eliminado) VALUES (32, 'Roles de Usuarios', false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, nombre, idmodulo, eliminado) VALUES (840, 'Acceso al Módulo', 32, false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, nombre, idmodulo, eliminado) VALUES (841, 'Consultar', 32, false)`);
        await queryRunner.query(`INSERT INTO public.funcionalidad(id, nombre, idmodulo, eliminado) VALUES (842, 'Editar Roles', 32, false)`);
        await queryRunner.query(`DROP TABLE public.dependencia_funcionalidad`);
        await queryRunner.query(`UPDATE public.funcionalidad SET eliminado = true WHERE LOWER(funcionalidad.nombre) LIKE 'consultar último%'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad = 840`);
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad = 841`);
        await queryRunner.query(`DELETE FROM public.permiso WHERE idfuncionalidad = 842`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id = 840`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id = 841`);
        await queryRunner.query(`DELETE FROM public.funcionalidad WHERE id = 842`);
        await queryRunner.query(`DELETE FROM public.modulo WHERE id = 32`);
        await queryRunner.query(`UPDATE public.funcionalidad SET eliminado = false WHERE LOWER(funcionalidad.nombre) LIKE 'consultar último%'`);
        await queryRunner.query(
            `CREATE TABLE public.dependencia_funcionalidad (
                idfuncionalidad integer NOT NULL,
                idfuncionalidad_dependencia integer NOT NULL
            )`
        );
        await queryRunner.query(
            `ALTER TABLE ONLY public.dependencia_funcionalidad
            ADD CONSTRAINT pk_dependencia_funcionalidad PRIMARY KEY (idfuncionalidad, idfuncionalidad_dependencia)`
        );
        await queryRunner.query(
            `ALTER TABLE ONLY public.dependencia_funcionalidad
            ADD CONSTRAINT fk_idfuncionalidad FOREIGN KEY (idfuncionalidad) REFERENCES public.funcionalidad(id) NOT VALID`
        );
        await queryRunner.query(
            `ALTER TABLE ONLY public.dependencia_funcionalidad
            ADD CONSTRAINT fk_idfuncionalidad_dependencia FOREIGN KEY (idfuncionalidad_dependencia) REFERENCES public.funcionalidad(id) NOT VALID`
        );
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (6, 7)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (24, 1)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (25, 1)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (25, 26)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (65, 40)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (84, 40)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (84, 60)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (86, 85)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (165, 1)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (165, 40)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (165, 60)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (165, 80)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (165, 120)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (165, 164)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (166, 20)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (166, 167)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (166, 180)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (166, 200)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (184, 40)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (184, 60)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (184, 80)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (184, 120)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (185, 120)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (185, 186)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (204, 80)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (204, 205)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (224, 20)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (245, 246)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (245, 340)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (260, 360)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (321, 120)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (360, 160)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (361, 1)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (361, 20)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (361, 120)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (380, 20)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (380, 160)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (380, 180)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (380, 220)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (380, 240)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (380, 260)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (405, 406)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (405, 401)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (481, 486)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (484, 482)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (522, 182)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (523, 182)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (521, 180)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (407, 482)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (407, 484)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (407, 441)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (407, 401)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (726, 725)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (726, 721)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (605, 606)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (603, 601)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (685, 686)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (683, 681)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (680, 601)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (640, 646)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (645, 646)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (645, 681)`);
        await queryRunner.query(`INSERT INTO public.dependencia_funcionalidad VALUES (645, 721)`);
    }

}
