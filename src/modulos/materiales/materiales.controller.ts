import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { MaterialesService } from './materiales.service';
import { MaterialDTO } from '@dto/material.dto';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { MaterialView } from '@database/view/depositos/material.view';
import { MaterialIdentificable } from '@database/entity/depositos/material-identificable.entity';
import { AuthGuard } from '@auth/auth.guard';
import { RequirePermission } from '@auth/require-permission.decorator';
import { Permissions } from '@auth/permission.list';

@Controller('materiales')
@UseFilters(HttpExceptionFilter)
@UseGuards(AuthGuard)
export class MaterialesController {

    constructor(
        private materialesSrv: MaterialesService,
        private jwtUtils: JwtUtilsService
    ){}

    @Get()
    @RequirePermission(Permissions.MATERIALES.CONSULTAR)
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<MaterialView[]>{
        return this.materialesSrv.findAll(queries);
    }

    @Get('ultimoid')
    @RequirePermission(Permissions.MATERIALES.CONSULTARULTIMOID)
    getLastId(): Promise<number>{
        return this.materialesSrv.getLastId();
    }

    @Get('total')
    @RequirePermission(Permissions.MATERIALES.CONSULTAR)
    count(
        @Query() queries: {[name:string]: any}
    ): Promise<number>{
        return this.materialesSrv.count(queries);
    }

    @Get('identificables')
    @RequirePermission(Permissions.MATERIALES.CONSULTAR)
    findAllIdentificables(
        @Query() queries: QueriesType
    ): Promise<MaterialIdentificable[]>{
        return this.materialesSrv.findAllIdentificables(queries);
    }

    @Get('identificables/total')
    @RequirePermission(Permissions.MATERIALES.CONSULTAR)
    countIdentificables(
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.materialesSrv.countIdentificables(queries);
    }
    
    @Get(':id/identificables/ultimoserialgenerado')
    @RequirePermission(Permissions.MATERIALES.CONSULTAR)
    getLastGeneratedSerial(
        @Param('id') idmaterial: number
    ): Promise<string>{
        return this.materialesSrv.getUltimoNroSerieAutogenerado(idmaterial);
    }

    @Get(':id/identificables')
    @RequirePermission(Permissions.MATERIALES.CONSULTAR)
    findAllIdentificablesByMaterial(
        @Param('id') idmaterial: number,
        @Query() queries: QueriesType
    ): Promise<MaterialIdentificable[]>{
        return this.materialesSrv.findAllIdentificables({idmaterial, ...queries});
    }

    

    @Get(':id/identificables/total')
    @RequirePermission(Permissions.MATERIALES.CONSULTAR)
    countIdentificablesByMaterial(
        @Param('id') idmaterial: number,
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.materialesSrv.countIdentificables({idmaterial, ...queries});
    }

    @Get(':id')
    @RequirePermission(Permissions.MATERIALES.CONSULTAR)
    findById(
        @Param('id') id: number
    ): Promise<MaterialView>{
        return this.materialesSrv.findById(id);
    }

    @Post()
    @RequirePermission(Permissions.MATERIALES.REGISTRAR)
    async create(
        @Body() materialDto: MaterialDTO,
        @Headers('authorization') auth: string
    ){
        await this.materialesSrv.create(
            DTOEntityUtis.materialDTOtoEntity(materialDto),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Put(':id')
    @RequirePermission(Permissions.MATERIALES.EDITAR)
    async update(
        @Param('id') id: number,
        @Body() materialDto: MaterialDTO,
        @Headers('authorization') auth: string
    ){
        await this.materialesSrv.update(
            id,
            DTOEntityUtis.materialDTOtoEntity(materialDto),
            this.jwtUtils.extractJwtSub(auth)
        );
    }

    @Delete(':id')
    @RequirePermission(Permissions.MATERIALES.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.materialesSrv.delete(id, this.jwtUtils.extractJwtSub(auth));
    }
    
}

type QueriesType = {[name: string]: any}