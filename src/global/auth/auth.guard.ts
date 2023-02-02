import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Permiso } from '@database/entity/permiso.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    @InjectRepository(Permiso)
    private permisoRepo: Repository<Permiso>,
    private reflector: Reflector,
    private jwtsrv: JwtService
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const funcionalidad = this.reflector.get<number>('funcionalidad', context.getHandler());
    if(!funcionalidad) return false;

    const auth = context.switchToHttp().getRequest().headers['authorization'];
    if(!auth) return false;
    
    const jwtPayload = this.validateJwt(auth.split(' ')[1])
    if(!jwtPayload) return false
    
    return this.tienePermiso(jwtPayload.sub, funcionalidad)
  }

  validateJwt(token: string) {
    try {
      return this.jwtsrv.verify(token, { secret: process.env.ACCESS_TOKEN_SECRET });
    } catch (e) {
      console.log('Token inválido', e);
      return null
    }
  }

  async tienePermiso(idusuario, idfuncionalidad): Promise<boolean> {
    return (await this.permisoRepo.findOneBy({idusuario, idfuncionalidad})) != null;
  }
}
