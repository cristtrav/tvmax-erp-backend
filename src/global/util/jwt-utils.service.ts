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
}
