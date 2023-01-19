import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as argon2 from "argon2";
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '@database/entity/usuario.entity';
import { Repository } from 'typeorm';
import { Sesion } from '@database/entity/sesion.entity';
import { TokenSesionDTO } from '@dto/token-sesion.dto';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SesionService {

    constructor(
        @InjectRepository(Usuario)
        private usuarioRepo: Repository<Usuario>,
        @InjectRepository(Sesion)
        private sesionRepo: Repository<Sesion>,
        private jwtUtilSrv: JwtUtilsService,
        private jwtSrv: JwtService
    ){}

    async login(ci: string, password: string): Promise<TokenSesionDTO> {
        const usuario = await this.usuarioRepo.findOneBy({ci, eliminado: false, accesoSistema: true});
        if(!usuario) throw new HttpException({
            message: 'Error de nro. de documento o contraseña.'
        }, HttpStatus.FORBIDDEN);
        if(!await argon2.verify(usuario.password, password)) throw new HttpException({
            message: 'Error de nro. de documento o contraseña.'
        }, HttpStatus.FORBIDDEN);
        const tokenSesion: TokenSesionDTO = this.jwtUtilSrv.generarToken(usuario, true);
        this.guardarRefreshToken(usuario.id, tokenSesion.refreshToken);
        return tokenSesion;
    }

    async guardarRefreshToken(idusuario: number, token: string){
        const sesion: Sesion = new Sesion();
        sesion.token = token;
        sesion.idusuario = idusuario;
        sesion.fechaHora = new Date();
        await this.sesionRepo.save(sesion);
    }

    async refresh(token: string): Promise<TokenSesionDTO>{
        const sesion: Sesion = await this.sesionRepo.findOneByOrFail({token});
        const usuario: Usuario = await this.usuarioRepo.findOneByOrFail({id: sesion.idusuario});
        this.jwtSrv.verify(token, {secret: process.env.REFRESH_TOKEN_SECRET});
        return this.jwtUtilSrv.generarToken(usuario, false); 
    }

    async logout(token: string){
        await this.sesionRepo.delete({token});
    }
}
