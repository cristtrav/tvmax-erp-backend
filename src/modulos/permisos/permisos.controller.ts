import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { Funcionalidad } from '@database/entity/funcionalidad.entity';
import { Modulo } from '@database/entity/modulo.entity';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Body, Controller, Get, Headers, Param, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { PermisosService } from './permisos.service';

@Controller('permisos')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class PermisosController {

    constructor(
        private permisosSrv: PermisosService,
        private jwtUtils: JwtUtilsService
    ) { }

    @Get()
    @RequirePermission(Permissions.PERMISOS.CONSULTARMODULOSFUNCIONALIDADES)
    findAllModulos(
        @Query() queries: { [name: string]: any }
    ): Promise<Modulo[]> {
        return this.permisosSrv.findAllModulos(queries);
    }

    @Get(':idusuario')
    @RequirePermission(Permissions.PERMISOS.CONSULTARPERMISOSUSUARIO)
    findAllByIdusuario(
        @Query() queries: { [name: string]: any },
        @Param('idusuario') idusuario: number
    ): Promise<Funcionalidad[]> {
        return this.permisosSrv.findPermisosByIdUsuario(idusuario, queries);        
    }

    @Put(':idusuario')
    @RequirePermission(Permissions.PERMISOS.EDITARPERMISOSUSUARIO)
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
