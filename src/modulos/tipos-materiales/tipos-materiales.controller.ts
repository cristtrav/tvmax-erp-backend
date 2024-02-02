import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { TiposMaterialesService } from './tipos-materiales.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { TipoMaterial } from '@database/entity/depositos/tipo-material.entity';
import { TipoMaterialView } from '@database/view/depositos/tipos-materiales.view';
import { AuthGuard } from '@auth/auth.guard';
import { RequirePermission } from '@auth/require-permission.decorator';
import { Permissions } from '@auth/permission.list';
import { TipoMaterialDTO } from '@dto/depositos/tipo-material.dto';

@Controller('tiposmateriales')
@UseFilters(HttpExceptionFilter)
@UseGuards(AuthGuard)
export class TiposMaterialesController {

    constructor(
        private tiposMaterialesSrv: TiposMaterialesService,
        private jwtUtils: JwtUtilsService
    ){}

    @Get()
    @RequirePermission(Permissions.TIPOSMATERIALES.CONSULTAR)
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<TipoMaterialView[]>{
        return this.tiposMaterialesSrv.findAll(queries)
    }

    @Get('total')
    @RequirePermission(Permissions.TIPOSMATERIALES.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.tiposMaterialesSrv.count(queries);
    }

    @Get('ultimoid')
    @RequirePermission(Permissions.TIPOSMATERIALES.CONSULTARULTIMOID)
    getLastId(): Promise<number>{
        return this.tiposMaterialesSrv.getLastId();
    }

    @Post()
    @RequirePermission(Permissions.TIPOSMATERIALES.REGISTRAR)
    async create(
        @Body() tipoMaterial: TipoMaterialDTO,
        @Headers('authorization') auth: string 
    ){
        await this.tiposMaterialesSrv.create(
            DTOEntityUtis.tipoMaterialDTOtoEntity(tipoMaterial),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Get(':id')
    @RequirePermission(Permissions.TIPOSMATERIALES.CONSULTAR)
    async findById(
        @Param('id') id: number
    ): Promise<TipoMaterial>{
        return this.tiposMaterialesSrv.findById(id);
    }

    @Put(':id')
    @RequirePermission(Permissions.TIPOSMATERIALES.EDITAR)
    async edit(
        @Body() tipoMaterialDto: TipoMaterialDTO,
        @Headers('authorization') auth: string,
        @Param('id') oldid: number
    ){
        await this.tiposMaterialesSrv.update(
            oldid,
            DTOEntityUtis.tipoMaterialDTOtoEntity(tipoMaterialDto),
            this.jwtUtils.extractJwtSub(auth)
        )
    }

    @Delete(':id')
    @RequirePermission(Permissions.TIPOSMATERIALES.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.tiposMaterialesSrv.delete(id, this.jwtUtils.extractJwtSub(auth));
    }
}
