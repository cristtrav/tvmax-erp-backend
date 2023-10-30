import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters } from '@nestjs/common';
import { MaterialesService } from './materiales.service';
import { MaterialView } from '@database/view/material.view';
import { MaterialDTO } from '@dto/material.dto';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';

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
