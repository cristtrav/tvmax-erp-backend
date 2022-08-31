import { Controller, Post, Body, HttpException, HttpStatus, Delete } from '@nestjs/common';
import { SesionService } from './sesion.service';
import { TokenSesion } from './../../dto/token-sesion.dto';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '@database/database.service';  
import { Funcionario } from '@dto/funcionario.dto';

@Controller('sesion')
export class SesionController {

    constructor(
        private sesionSrv: SesionService,
        private readonly jwtsrv: JwtService,
        private dbsrv: DatabaseService
    ) { }

    @Post('login')
    async login(@Body() user: { ci: string, password: string }): Promise<TokenSesion> {
        const loggedUser: Funcionario = await this.sesionSrv.login(user)
        if (!loggedUser) throw new HttpException('Error de usuario o contraseña', HttpStatus.UNAUTHORIZED)
        const sesToken: TokenSesion = this.generarToken(loggedUser, true)
        this.sesionSrv.guardarRefreshToken(loggedUser.id, sesToken.refreshToken)
        return sesToken
    }

    @Post('refresh')
    async refresh(@Body() token: { refreshToken: string }): Promise<TokenSesion> {
        try{
            this.jwtsrv.verify(token.refreshToken, {secret: process.env.REFRESH_TOKEN_SECRET});
        }catch(e){
            console.log('Error al verificar token de refresh');
            await this.dbsrv.execute(`DELETE FROM public.refresh_tokens WHERE token = $1`, [token.refreshToken]);
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
        const usr: Funcionario = await this.sesionSrv.refresh(token.refreshToken)
        if (!usr) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
        var sesToken: TokenSesion = this.generarToken(usr, false)
        return sesToken
    }

    @Post('logout')
    async logout(@Body() token: {refreshToken: string}){
        await this.sesionSrv.logout(token.refreshToken)
    }

    private generarToken(usr: Funcionario, crearRefresh: boolean): TokenSesion {
        var sesToken: TokenSesion = new TokenSesion()
        sesToken.nombreUsuario = `${usr.nombres} ${usr.apellidos}`
        sesToken.accessToken = this.jwtsrv.sign({ sub: usr.id }, {
            secret: process.env.ACCESS_TOKEN_SECRET,
            expiresIn: '10m'
        })
        if (crearRefresh) {
            sesToken.refreshToken = this.jwtsrv.sign({ sub: usr.id }, {
                secret: process.env.REFRESH_TOKEN_SECRET
            })
        }
        return sesToken;
    }
}
