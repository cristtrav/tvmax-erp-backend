import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from './../../global/database/database.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private reflector: Reflector,
    private jwtsrv: JwtService,
    private dbsrv: DatabaseService
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const funcionalidad = this.reflector.get<number>('funcionalidad', context.getHandler());
    if (!funcionalidad) return false
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const auth = request.headers['authorization']
    if (!auth) return false
    const jwtPayload = this.validateJwt(auth.split(' ')[1])
    if(!jwtPayload) return false
    const idusuario = jwtPayload.sub
    return this.tienePermiso(idusuario, funcionalidad)
  }

  validateJwt(token: string) {
    try {
      return this.jwtsrv.verify(token, { secret: process.env.ACCESS_TOKEN_SECRET });
    } catch (e) {
      return null
    }
  }

  async tienePermiso(idusuario, idfucionalidad): Promise<boolean> {
    const query = `SELECT * FROM public.permiso WHERE idfuncionario = $1 AND idfuncionalidad = $2`
    const params = [idusuario, idfucionalidad]
    const result = await this.dbsrv.execute(query, params)
    if (result.rowCount === 0) {
      return false
    } else {
      return true
    }
  }
}
