import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class LoginGuard implements CanActivate {

  constructor(    
    private jwtsrv: JwtService
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const auth = context.switchToHttp().getRequest().headers['authorization'];
    if(!auth) return false;
    const jwtPayload = this.validateJwt(auth.split(' ')[1])
    if(!jwtPayload) return false
    return true;
  }

  private validateJwt(token: string) {
    try {
      return this.jwtsrv.verify(token, { secret: process.env.ACCESS_TOKEN_SECRET });
    } catch (e) {
      console.log('Token inválido', e);
      return null
    }
  }
}
