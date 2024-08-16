import { Funcionalidad } from '@database/entity/funcionalidad.entity';
import { Permiso } from '@database/entity/permiso.entity';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppInitService implements OnApplicationBootstrap {

    private readonly ID_USUARIO_ADMIN = 2;

    constructor(
        private datasource: DataSource
    ){}

    async onApplicationBootstrap() {        
        await this.asignarPermisosAdmin();
    }

    private async asignarPermisosAdmin(){
        const funcionalidades =
            await this.datasource
            .getRepository(Funcionalidad)
            .findBy({eliminado: false});
        const permisos: Permiso[] = funcionalidades.map(f => {
            const p = new Permiso();
            p.idfuncionalidad = f.id;
            p.idusuario = this.ID_USUARIO_ADMIN;
            return p;
        });
        for(let permiso of permisos) await this.datasource.getRepository(Permiso).save(permiso);
    }

}
