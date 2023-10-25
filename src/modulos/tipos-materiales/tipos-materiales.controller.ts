import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseFilters } from '@nestjs/common';
import { TiposMaterialesService } from './tipos-materiales.service';
import { TipoMaterial } from '@database/entity/tipo-material.entity';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { TipoMaterialDTO } from '@dto/tipo-material.dto';
import { DTOEntityUtis } from '@globalutil/dto-entity-utils';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';

@Controller('tiposmateriales')
@UseFilters(HttpExceptionFilter)
export class TiposMaterialesController {

    constructor(
        private tiposMaterialesSrv: TiposMaterialesService,
        private jwtUtils: JwtUtilsService
    ){}

    @Get()
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<TipoMaterial[]>{
        return this.tiposMaterialesSrv.findAll(queries)
    }

    @Get('total')
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.tiposMaterialesSrv.count(queries);
    }

    @Get('ultimoid')
    getLastId(): Promise<number>{
        return this.tiposMaterialesSrv.getLastId();
    }

    @Post()
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
    async findById(
        @Param('id') id: number
    ): Promise<TipoMaterial>{
        return this.tiposMaterialesSrv.findById(id);
    }

    @Put(':id')
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
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ){
        await this.tiposMaterialesSrv.delete(id, this.jwtUtils.extractJwtSub(auth));
    }
}
