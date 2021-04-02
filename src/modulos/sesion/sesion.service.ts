import { Injectable } from '@nestjs/common';
import { DatabaseService } from './../../global/database/database.service';
import { Usuario } from './../../dto/usuario.dto';
import * as argon2 from "argon2";

@Injectable()
export class SesionService {

    constructor(private dbsrv: DatabaseService){
    }

    async login(reqUsr: {ci: string, password: string}): Promise<Usuario> {
        const query = `SELECT * FROM public.usuario WHERE ci = $1 AND eliminado = false AND activo = true`
        const params = [reqUsr.ci]
        const response = await this.dbsrv.execute(query, params)
        var dbUsr: Usuario = response?.rows[0] 
        if(!dbUsr) return null
        if(await argon2.verify(dbUsr.password, reqUsr.password)) return dbUsr
        return null
    }

    async guardarRefreshToken(idusuario: number, token: string){
        const query = `INSERT INTO public.refresh_tokens(token, idusuario) VALUES($1, $2)`
        const params = [token, idusuario]
        await this.dbsrv.execute(query, params)
    }

    async refresh(token: string): Promise<Usuario>{
        const queryToken = `SELECT * FROM public.refresh_tokens WHERE token = $1`
        const paramsToken = [token]
        const resultToken = await this.dbsrv.execute(queryToken, paramsToken)
        if(resultToken.rowCount === 0) return null
        const queryUser = `SELECT * FROM public.usuario WHERE id = $1`
        const paramsUser = [resultToken.rows[0]?.idusuario]
        const resultUser = await this.dbsrv.execute(queryUser, paramsUser)
        return resultUser.rows[0]
    }

    async logout(token: string){
        const query = `DELETE FROM public.refresh_tokens WHERE token = $1`
        const params = [token]
        await this.dbsrv.execute(query, params)
    }


}
