import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters, UseGuards } from '@nestjs/common';
import { MaterialesService } from './materiales.service';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { MaterialView } from '@database/view/depositos/material.view';
import { MaterialIdentificable } from '@database/entity/depositos/material-identificable.entity';
import { Permissions } from '@auth/permission.list';
import { MaterialDTO } from '@dto/depositos/material.dto';
import { LoginGuard } from '@auth/guards/login.guard';
import { AllowedInGuard } from '@auth/guards/allowed-in.guard';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';

@Controller('materiales')
@UseFilters(HttpExceptionFilter)
@UseGuards(LoginGuard, AllowedInGuard)
export class MaterialesController {

    constructor(
        private materialesSrv: MaterialesService,
        private jwtUtils: JwtUtilsService
    ){}

    @Get()
    @AllowedIn(
        Permissions.MATERIALES.CONSULTAR,
        Permissions.MOVIMIENTOSMATERIALES.ACCESOFORMULARIO
    )
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<MaterialView[]>{
        return this.materialesSrv.findAll(queries);
    }

    @Get('ultimoid')
    @AllowedIn(Permissions.MATERIALES.ACCESOFORMULARIO)
    getLastId(): Promise<number>{
        return this.materialesSrv.getLastId();
    }

    @Get('total')
    @AllowedIn(
        Permissions.MATERIALES.CONSULTAR,
        Permissions.MOVIMIENTOSMATERIALES.ACCESOFORMULARIO
    )
    count(
        @Query() queries: {[name:string]: any}
    ): Promise<number>{
        return this.materialesSrv.count(queries);
    }

    @Get('identificables')
    @AllowedIn(
        Permissions.MATERIALES.CONSULTAR,
        /*Permissions.MOVIMIENTOSMATERIALES.ACCESOFORMULARIO*/
    )
    findAllIdentificables(
        @Query() queries: QueriesType
    ): Promise<MaterialIdentificable[]>{
        return this.materialesSrv.findAllIdentificables(queries);
    }

    @Get('identificables/total')
    @AllowedIn(Permissions.MATERIALES.CONSULTAR)
    countIdentificables(
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.materialesSrv.countIdentificables(queries);
    }
    
    @Get(':id/identificables/ultimoserialgenerado')
    @AllowedIn(Permissions.MOVIMIENTOSMATERIALES.ACCESOFORMULARIO)
    getLastGeneratedSerial(
        @Param('id') idmaterial: number
    ): Promise<string>{
        return this.materialesSrv.getUltimoNroSerieAutogenerado(idmaterial);
    }

    @Get(':id/identificables')
    @AllowedIn(
        Permissions.MATERIALES.ACCESOMODULO,
        Permissions.MOVIMIENTOSMATERIALES.ACCESOFORMULARIO
    )
    findAllIdentificablesByMaterial(
        @Param('id') idmaterial: number,
        @Query() queries: QueriesType
    ): Promise<MaterialIdentificable[]>{
        return this.materialesSrv.findAllIdentificables({idmaterial, ...queries});
    }

    

    @Get(':id/identificables/total')
    @AllowedIn(Permissions.MATERIALES.ACCESOMODULO)
    countIdentificablesByMaterial(
        @Param('id') idmaterial: number,
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.materialesSrv.countIdentificables({idmaterial, ...queries});
    }

    @Get(':id')
    findById(
        @Param('id') id: number
    ): Promise<MaterialView>{
        return this.materialesSrv.findById(id);
    }

    @Post()
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
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.materialesSrv.delete(id, this.jwtUtils.extractJwtSub(auth));
    }
    
}

type QueriesType = {[name: string]: any}