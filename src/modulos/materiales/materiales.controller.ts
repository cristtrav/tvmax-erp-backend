import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters } from '@nestjs/common';
import { MaterialesService } from './materiales.service';
import { MaterialDTO } from '@dto/material.dto';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { MaterialView } from '@database/view/depositos/material.view';
import { MaterialIdentificable } from '@database/entity/depositos/material-identificable.entity';

@Controller('materiales')
@UseFilters(HttpExceptionFilter)
export class MaterialesController {

    constructor(
        private materialesSrv: MaterialesService,
        private jwtUtils: JwtUtilsService
    ){}

    @Get()
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<MaterialView[]>{
        return this.materialesSrv.findAll(queries);
    }

    @Get('ultimoid')
    getLastId(): Promise<number>{
        return this.materialesSrv.getLastId();
    }

    @Get('total')
    count(
        @Query() queries: {[name:string]: any}
    ): Promise<number>{
        return this.materialesSrv.count(queries);
    }

    @Get('identificables')
    findAllIdentificables(
        @Query() queries: QueriesType
    ): Promise<MaterialIdentificable[]>{
        return this.materialesSrv.findAllIdentificables(queries);
    }

    @Get('identificables/total')
    countIdentificables(
        @Query() queries: QueriesType
    ): Promise<number>{
        return this.materialesSrv.countIdentificables(queries);
    }

    @Get(':id/identificables')
    findAllIdentificablesByMaterial(
        @Param('id') idmaterial: number,
        @Query() queries: QueriesType
    ): Promise<MaterialIdentificable[]>{
        return this.materialesSrv.findAllIdentificables({idmaterial, ...queries});
    }

    @Get(':id/identificables/total')
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