import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../global/database/database.service';
import { Usuario } from '../../dto/usuario.dto';
import * as argon2 from "argon2";

@Injectable()
export class UsuariosService {

    constructor(
        private dbsrv: DatabaseService
    ){}

    async findAll(queryParam): Promise<Usuario[]>{
        const { eliminado, sort, offset, limit } = queryParam;
        var query: string = 'SELECT * FROM public.usuario';
        const param: any[] = [];
        if(eliminado){
            query += ` WHERE eliminado = $1`;
            param.push(eliminado);
        }
        if(sort){
            const srtOrder: string = sort.substring(0, 1) === '-' ? 'DESC' : 'ASC';
            const srtColumn: string = sort.substring(1, sort.length);
            query += ` ORDER BY ${srtColumn} ${srtOrder}`;
        }
        if(offset && limit){
            query += ` OFFSET ${offset} LIMIT ${limit}`;
        }
        return (await this.dbsrv.execute(query, param)).rows;
    }

    async count(queryParam): Promise<number>{
        const { eliminado } = queryParam;
        var query: string = 'SELECT COUNT(*) FROM public.usuario';
        const params: any[] = [];
        if(eliminado){
            query += ` WHERE eliminado = $1`;
            params.push(eliminado);
        }
        return (await this.dbsrv.execute(query, params)).rowCount;
    }

    async create(u: Usuario){
        const cli = await this.dbsrv.getDBClient();
        const query: string = `INSERT INTO public.usuario(id, nombres, apellidos, ci, email, telefono, activo)
        VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
        const params: any[] = [u.id, u.nombres, u.apellidos, u.ci, u.email, u.telefono, u.activo]
        try{
            cli.query('BEGIN');
            await cli.query(query, params);
            if(u.password){
                const pwdHash = await argon2.hash(u.password);
                await cli.query('UPDATE public.usuario SET password = $1 WHERE id = $2', [pwdHash, u.id]);
            }
            cli.query('COMMIT');
        }catch(e){
            cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
        

    }

    async findById(id: number): Promise<Usuario | null>{
        const query: string = `SELECT * FROM public.usuario WHERE id = $1`;
        const rows: Usuario[] = (await this.dbsrv.execute(query, [id])).rows;
        if(rows.length === 0) return null;
        return rows[0];
    }

    async edit(oldId: number, u: Usuario): Promise<boolean>{
        const cli = await this.dbsrv.getDBClient();
        const query: string = `UPDATE public.usuario SET id = $1, nombres = $2, apellidos = $3, ci = $4, email = $5, telefono = $6, activo = $7 WHERE id = $8`;
        const params: any[] = [u.id, u.nombres, u.apellidos, u.ci, u.email, u.telefono, u.activo, oldId];
        let rowCount = 0;
        try{
            await cli.query('BEGIN');
            rowCount = (await cli.query(query, params)).rowCount;
            if(u.password){
                const pwdHash = await argon2.hash(u.password);
                await cli.query('UPDATE public.usuario SET password = $1 WHERE id = $2', [pwdHash, u.id]);
            }
            await cli.query('COMMIT');
        }catch(e){
            await cli.query('ROLLBACK');
            throw e;
        }finally{
            cli.release();
        }
        return (await this.dbsrv.execute(query, params)).rowCount > 0;
    }

    async delete(id: number): Promise<boolean>{
        const query: string = `UPDATE public.usuario SET eliminado = true WHERE id = $1`;
        return (await this.dbsrv.execute(query, [id])).rowCount > 0;
    }

}
