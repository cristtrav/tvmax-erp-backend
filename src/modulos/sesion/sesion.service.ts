import { Injectable } from '@nestjs/common';
import { DatabaseService } from './../../global/database/database.service';
import * as argon2 from "argon2";
import { Funcionario } from '@dto/funcionario.dto';

@Injectable()
export class SesionService {

    constructor(private dbsrv: DatabaseService){
    }

    async login(reqUsr: {ci: string, password: string}): Promise<Funcionario> {
        const query = `SELECT * FROM public.funcionario WHERE ci = $1 AND eliminado = false AND activo = true`
        const params = [reqUsr.ci]
        const response = await this.dbsrv.execute(query, params)
        var dbUsr: Funcionario = response?.rows[0] 
        if(!dbUsr) return null
        if(await argon2.verify(dbUsr.password, reqUsr.password)) return dbUsr
        return null
    }

    async guardarRefreshToken(idfuncionario: number, token: string){
        const query = `INSERT INTO public.refresh_tokens(token, idfuncionario) VALUES($1, $2)`
        const params = [token, idfuncionario]
        await this.dbsrv.execute(query, params)
    }

    async refresh(token: string): Promise<Funcionario>{
        const queryToken = `SELECT * FROM public.refresh_tokens WHERE token = $1`
        const paramsToken = [token]
        const resultToken = await this.dbsrv.execute(queryToken, paramsToken)
        if(resultToken.rowCount === 0) return null
        const queryUser = `SELECT * FROM public.funcionario WHERE id = $1`
        const paramsUser = [resultToken.rows[0]?.idfuncionario]
        const resultUser = await this.dbsrv.execute(queryUser, paramsUser)
        return resultUser.rows[0]
    }

    async logout(token: string){
        const query = `DELETE FROM public.refresh_tokens WHERE token = $1`
        const params = [token]
        await this.dbsrv.execute(query, params)
    }


}
