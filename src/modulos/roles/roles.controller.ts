import { Permissions } from '@auth/permission.list';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { Rol } from '@database/entity/rol.entity';
import { RolView } from '@database/view/rol.view';
import { RolDTO } from 'src/global/dto/rol.dto';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';

@Controller('roles')
@UseGuards(LoginGuard, AllowedInGuard)
@UseFilters(HttpExceptionFilter)
export class RolesController {

    constructor(
        private rolesSrv: RolesService,
        private jwtUtils: JwtUtilsService
    ){}

    @Get()
    @AllowedIn(
        Permissions.ROLES.CONSULTAR,
        Permissions.ROLESUSUARIOS.CONSULTAR
    )
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<RolView[]>{
        return this.rolesSrv.findAll(queries);
    }

    @Post()
    @AllowedIn(Permissions.ROLES.REGISTRAR)
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
    @AllowedIn(Permissions.ROLES.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.rolesSrv.count(queries);
    }

    @Get('ultimoid')
    @AllowedIn(Permissions.ROLES.ACCESOFORMULARIO)
    getLastId(): Promise<number>{
        return this.rolesSrv.getLastId();
    }

    @Get(':idrol')
    @AllowedIn(Permissions.ROLES.ACCESOFORMULARIO)
    findById(
        @Param('idrol') idrol: number
    ): Promise<Rol>{
        return this.rolesSrv.findById(idrol);
    }

    @Put(':id')
    @AllowedIn(Permissions.ROLES.EDITAR)
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
    @AllowedIn(Permissions.ROLES.ELIMINAR)
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
