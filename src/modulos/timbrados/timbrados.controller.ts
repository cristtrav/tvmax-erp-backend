import { AuthGuard } from '@auth/auth.guard';
import { Permissions } from '@auth/permission.list';
import { RequirePermission } from '@auth/require-permission.decorator';
import { TimbradoDTO } from '@dto/timbrado.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseFilters, Headers } from '@nestjs/common';
import { JwtUtilsService } from '@globalutil/jwt-utils.service';
import { TimbradosService } from './timbrados.service';
import { TimbradoView } from '@database/view/timbrado.view';
import { HttpExceptionFilter } from '@globalfilter/http-exception.filter';
import { DTOEntityUtis } from '@database/dto-entity-utils';

@Controller('timbrados')
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
export class TimbradosController {

    constructor(
        private timbradosSrv: TimbradosService,
        private jwtUtil: JwtUtilsService
    ) { }

    @Post()
    @RequirePermission(Permissions.TIMBRADOS.REGISTRAR)
    async create(
        @Body() t: TimbradoDTO,
        @Headers('authorization') auth: string
        
    ) {
        await this.timbradosSrv.create(
            DTOEntityUtis.timbradoDtoToEntity(t),
            this.jwtUtil.extractJwtSub(auth)
        )
    }

    @Get()
    @RequirePermission(Permissions.TIMBRADOS.CONSULTAR)
    findAll(
        @Query() queries: {[name: string]: any}
    ): Promise<TimbradoView[]> {
        return this.timbradosSrv.findAll(queries);
    }

    @Get('total')
    @RequirePermission(Permissions.TIMBRADOS.CONSULTAR)
    count(
        @Query() queries: {[name: string]: any}
    ): Promise<number>{
        return this.timbradosSrv.count(queries);
    }

    @Get('ultimoid')
    @RequirePermission(Permissions.TIMBRADOS.CONSULTAR)
    getLastId(): Promise<number>
    {
        return this.timbradosSrv.getLastId();
    }

    @Get(':id')
    @RequirePermission(Permissions.TIMBRADOS.CONSULTAR)
    async findById(
        @Param('id') id: number
    ): Promise<TimbradoView> {
        return this.timbradosSrv.findById(id);
    }

    @Put(':id')
    @RequirePermission(Permissions.TIMBRADOS.EDITAR)
    async edit(
        @Param('id') oldid: number,
        @Body() t: TimbradoDTO,
        @Headers('authorization') auth: string
    ) {
        await this.timbradosSrv.edit(
            oldid,
            DTOEntityUtis.timbradoDtoToEntity(t),
            this.jwtUtil.extractJwtSub(auth)
        )
    }

    @Delete(':id')
    @RequirePermission(Permissions.TIMBRADOS.ELIMINAR)
    async delete(
        @Param('id') id: number,
        @Headers('authorization') auth: string
    ) {
        await this.timbradosSrv.delete(id, this.jwtUtil.extractJwtSub(auth));
    }
}
