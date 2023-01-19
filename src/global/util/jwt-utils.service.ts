import { Usuario } from '@database/entity/usuario.entity';
import { TokenSesionDTO } from '@dto/token-sesion.dto';
import { UsuarioDTO } from '@dto/usuario.dto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtUtilsService {

    constructor(
        private jwtSrv: JwtService
    ){}

    decodeIdUsuario(request: Request): number {
        const authToken: string = request.headers['authorization'].split(" ")[1];
        return Number(this.jwtSrv.decode(authToken)['sub']);
    }

    extractJwtSub(authStr: string): number{
        return Number(this.jwtSrv.decode(authStr.split(' ')[1])['sub']);
    }

    generarToken(usr: UsuarioDTO | Usuario, crearRefresh: boolean): TokenSesionDTO {
        var sesToken: TokenSesionDTO = new TokenSesionDTO()
        sesToken.nombreUsuario = `${usr.nombres} ${usr.apellidos}`
        sesToken.accessToken = this.jwtSrv.sign({ sub: usr.id }, {
            secret: process.env.ACCESS_TOKEN_SECRET,
            expiresIn: '2m'
        })
        if (crearRefresh) {
            sesToken.refreshToken = this.jwtSrv.sign({ sub: usr.id }, {
                secret: process.env.REFRESH_TOKEN_SECRET
            })
        }
        return sesToken;
    }
}
