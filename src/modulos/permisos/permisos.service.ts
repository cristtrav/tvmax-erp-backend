import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { Modulo } from '@dto/modulo.dto';
import { Funcionalidad } from '@dto/funcionalidad.dto';
import { Client } from 'pg';
import { WhereParam } from '@util/whereparam';

@Injectable()
export class PermisosService {
    constructor(
        private dbsrv: DatabaseService
    ) { }

    async findAllModulos(reqQuery): Promise<Modulo[]> {
        const { eliminado, sort, offset, limit } = reqQuery;
        const iwp: WhereParam = new WhereParam(
            { eliminado },
            null,
            null,
            null,
            { sort, offset, limit }
        );
        const queryModulos: string = `SELECT * FROM public.modulo ${iwp.whereStr} ${iwp.sortOffsetLimitStr}`;
        const lstModulos: Modulo[] = (await this.dbsrv.execute(queryModulos, iwp.whereParams)).rows;
        for (let m of lstModulos) {
            const queryFunc: string = `SELECT * FROM public.funcionalidad WHERE idmodulo = $1 AND eliminado = false ORDER BY descripcion ASC`;
            const lstFunc: Funcionalidad[] = (await this.dbsrv.execute(queryFunc, [m.id])).rows;
            m.funcionalidades = lstFunc;
        }
        return lstModulos;
    }

    async findByIdUsuario(idusuario: number, reqQuery): Promise<Funcionalidad[]> {
        const { eliminado, sort, offset, limit } = reqQuery;
        const sof: string = new WhereParam(null, null, null, null, {sort, offset, limit}).sortOffsetLimitStr;
        const queryPermisos: string = `SELECT * FROM public.funcionalidad 
        WHERE id IN (SELECT idfuncionalidad FROM public.permiso WHERE idusuario = $1) ${sof}`;
        return (await this.dbsrv.execute(queryPermisos, [idusuario])).rows;
    }

    async editPermisosUsuario(idusuario: number, idfuncionalidades: number[]): Promise<any> {
        const dbcli: Client = await this.dbsrv.getDBClient();
        try{
            dbcli.query('BEGIN');
            dbcli.query('DELETE FROM public.permiso WHERE idusuario = $1', [idusuario]);
            for(let idf of idfuncionalidades){
                dbcli.query(`INSERT INTO public.permiso(idusuario, idfuncionalidad) VALUES($1, $2)`, [idusuario, idf]);
            }
            dbcli.query('COMMIT');
        }catch(e){
            dbcli.query('ROLLBACK');
            console.log('Error al editar permisos de usuario');
            console.log(e);
            throw e;
        }finally{
            dbcli.release();
        }
    }
}
