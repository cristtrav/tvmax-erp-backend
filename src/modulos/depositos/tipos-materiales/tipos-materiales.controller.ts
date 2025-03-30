import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { TiposMaterialesService } from './tipos-materiales.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { JwtUtilsService } from '@globalutil/services/jwt-utils.service';
import { TipoMaterial } from '@database/entity/depositos/tipo-material.entity';
import { TipoMaterialView } from '@database/view/depositos/tipos-materiales.view';
import { Permissions } from '@auth/permission.list';
import { TipoMaterialDTO } from '@dto/depositos/tipo-material.dto';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';

@Controller('tiposmateriales')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class TiposMaterialesController {

    constructor(
        private tiposMaterialesSrv: TiposMaterialesService,
        private jwtUtils: JwtUtilsService
    ){}

    @Get()
    @AllowedIn(
        Permissions.TIPOSMATERIALES.CONSULTAR,
        Permissions.MATERIALES.ACCESOMODULO,
        Permissions.MATERIALES.ACCESOFORMULARIO
    )
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<TipoMaterialView[]>{
        return this.tiposMaterialesSrv.findAll(queries)
    }

    @Get('total')
    @AllowedIn(Permissions.TIPOSMATERIALES.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.tiposMaterialesSrv.count(queries);
    }

    @Get('ultimoid')
    @AllowedIn(Permissions.TIPOSMATERIALES.ACCESOFORMULARIO)
    getLastId(): Promise<number>{
        return this.tiposMaterialesSrv.getLastId();
    }

    @Post()
    @AllowedIn(Permissions.TIPOSMATERIALES.REGISTRAR)
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
    @AllowedIn(Permissions.TIPOSMATERIALES.ACCESOFORMULARIO)
    async findById(
        @Param('id') id: number
    ): Promise<TipoMaterial>{
        return this.tiposMaterialesSrv.findById(id);
    }

    @Put(':id')
    @AllowedIn(Permissions.TIPOSDOMICILIOS.EDITAR)
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
    @AllowedIn(Permissions.TIPOSMATERIALES.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.tiposMaterialesSrv.delete(id, this.jwtUtils.extractJwtSub(auth));
    }
}
