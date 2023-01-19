import { Controller, Post, Body, UseFilters } from '@nestjs/common';
import { SesionService } from './sesion.service';
import { TokenSesionDTO } from './../../dto/token-sesion.dto';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';

@Controller('sesion')
@UseFilters(HttpExceptionFilter)
export class SesionController {

    constructor(
        private sesionSrv: SesionService,
    ) { }

    @Post('login')
    login(
        @Body() user: { ci: string, password: string }
    ): Promise<TokenSesionDTO> {
        return this.sesionSrv.login(user.ci, user.password);
    }

    @Post('refresh')
    refresh(@Body() token: { refreshToken: string }): Promise<TokenSesionDTO> {
        try{
            return this.sesionSrv.refresh(token.refreshToken);
        }catch(e){
            console.log('Error al refrescar token', e);
            this.sesionSrv.logout(token.refreshToken);
            throw e;
        }
    }

    @Post('logout')
    async logout(@Body() token: {refreshToken: string}){
        await this.sesionSrv.logout(token.refreshToken)
    }
}
