import { Usuario } from '@database/entity/usuario.entity';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { Repository } from 'typeorm';
import * as argon2 from "argon2";

@Injectable()
export class CobranzaExternaGuard implements CanActivate {

  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const httpRequest = context.switchToHttp().getRequest();
    const usuario = httpRequest.body.usuario;
    const password = httpRequest.body.password;
    return this.login(usuario, password);
  }

  private async login(usuario: string, password: string): Promise<boolean> {
    const usr = await this.usuarioRepo.findOneBy({ id: Number(usuario) });
    if (
      usr != null &&
      usr.idrol == 5 &&
      usr.password != null &&
      password != null &&
      await argon2.verify(usr.password, password)
    ) return true;
    return false;
  }
}
