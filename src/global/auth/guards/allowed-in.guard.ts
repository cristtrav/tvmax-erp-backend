import { Permiso } from '@database/entity/permiso.entity';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { Repository } from 'typeorm';

@Injectable()
export class AllowedInGuard implements CanActivate {

  constructor(
    @InjectRepository(Permiso)
    private permisoRepo: Repository<Permiso>,
    private jwtUtilSrv: JwtUtilsService,
    private reflector: Reflector
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const auth = context.switchToHttp().getRequest().headers['authorization'];
    if(!auth) return false;
    const idusuario = this.jwtUtilSrv.extractJwtSub(auth);
    const idfuncionalidadesAutorizadas = this.reflector.get<number[]>('idfuncionalidades', context.getHandler());
    if(idfuncionalidadesAutorizadas == null || idusuario == null) return false;
    return this.tienePermiso(idusuario, idfuncionalidadesAutorizadas);
  }

  async tienePermiso(idusuario: number, idfuncionalidad: number[]): Promise<boolean> {
    const nroPermisosCoincidentes = await this.permisoRepo
      .createQueryBuilder('permiso')
      .where('permiso.idusuario = :idusuario', {idusuario})
      .andWhere(`permiso.idfuncionalidad IN (:...idfuncionalidad)`, {idfuncionalidad})
      .getCount();
    return nroPermisosCoincidentes > 0;
  }
}
