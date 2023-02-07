import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { Rol } from '@database/entity/rol.entity';
import { RolView } from '@database/view/rol.view';
import { RolDTO } from '@dto/rol.dto';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class RolesController {

    constructor(
        private rolesSrv: RolesService,
        private jwtUtils: JwtUtilsService
    ){}

    @Get()
    @RequirePermission(Permissions.ROLES.CONSULTAR)
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<RolView[]>{
        return this.rolesSrv.findAll(queries);
    }

    @Post()
    @RequirePermission(Permissions.ROLES.REGISTRAR)
    async create(
        @Body() rol: RolDTO,
        @Headers('authorization') auth: string
    ){
        await this.rolesSrv.create(
            DTOEntityUtis.rolDtoToEntity(rol),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Get('total')
    @RequirePermission(Permissions.ROLES.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.rolesSrv.count(queries);
    }

    @Get('ultimoid')
    @RequirePermission(Permissions.ROLES.CONSULTAR)
    getLastId(): Promise<number>{
        return this.rolesSrv.getLastId();
    }

    @Get(':idrol')
    @RequirePermission(Permissions.ROLES.CONSULTAR)
    findById(
        @Param('idrol') idrol: number
    ): Promise<Rol>{
        return this.rolesSrv.findById(idrol);
    }

    @Put(':id')
    @RequirePermission(Permissions.ROLES.EDITAR)
    async edit(
        @Param('id') oldId: number,
        @Body() rol: RolDTO,
        @Headers('authorization') auth: string
    ){
        await this.rolesSrv.edit(
            oldId,
            DTOEntityUtis.rolDtoToEntity(rol),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    @RequirePermission(Permissions.ROLES.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.rolesSrv.delete(
            id,
            this.jwtUtils.extractJwtSub(auth)
        );
    }


}
