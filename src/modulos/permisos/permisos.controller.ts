import { Permissions } from '@auth/permission.list';
import { Funcionalidad } from '@database/entity/funcionalidad.entity';
import { Modulo } from '@database/entity/modulo.entity';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { Body, Controller, Get, Headers, Param, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';

@Controller('permisos')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class PermisosController {

    constructor(
        private permisosSrv: PermisosService,
        private jwtUtils: JwtUtilsService
    ) { }

    @Get()
    @AllowedIn(Permissions.PERMISOS.CONSULTARMODULOSFUNCIONALIDADES)
    findAllModulos(
        @Query() queries: { [name: string]: any }
    ): Promise<Modulo[]> {
        return this.permisosSrv.findAllModulos(queries);
    }

    @Get(':idusuario')
    @AllowedIn(Permissions.PERMISOS.CONSULTARPERMISOSUSUARIO)
    findAllByIdusuario(
        @Query() queries: { [name: string]: any },
        @Param('idusuario') idusuario: number
    ): Promise<Funcionalidad[]> {
        return this.permisosSrv.findPermisosByIdUsuario(idusuario, queries);        
    }

    @Put(':idusuario')
    @AllowedIn(Permissions.PERMISOS.EDITARPERMISOSUSUARIO)
    async editPermisosUsuario(
        @Param('idusuario') idusuarioModificar: number,
        @Body() idfuncionalidades: number[],
        @Headers('authorization') auth: string
    ) {
        await this.permisosSrv.editPermisosUsuario(
            this.jwtUtils.extractJwtSub(auth),
            idusuarioModificar,
            idfuncionalidades
        );
    }
}
