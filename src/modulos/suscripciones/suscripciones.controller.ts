import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Permissions } from 'src/global/auth/permission.list';
import { RequirePermission } from 'src/global/auth/require-permission.decorator';
import { AuthGuard } from '../../global/auth/auth.guard';
import { SuscripcionesService } from './suscripciones.service';
import { ServerResponseList } from '../../dto/server-response-list.dto';
import { Suscripcion } from '../../dto/suscripcion.dto';

@Controller('suscripciones')
@UseGuards(AuthGuard)
export class SuscripcionesController {

    constructor(
        private suscripcionesSrv: SuscripcionesService
    ) { }

    @Get()
    @RequirePermission(Permissions.SUSCRIPCIONES.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number,
        @Query('idcliente') idcliente: number
    ): Promise<ServerResponseList<Suscripcion>> {
        try {
            const rows: Suscripcion[] = await this.suscripcionesSrv.findAll({ eliminado, idcliente, sort, offset, limit });
            const rowCount: number = await this.suscripcionesSrv.count({ eliminado, idcliente });
            return new ServerResponseList<Suscripcion>(rows, rowCount);
        } catch (e) {
            console.log('Error al consultar Suscripciones');
            console.log(e);
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('ultimoid')
    @RequirePermission(Permissions.SUSCRIPCIONES.CONSULTAR)
    async getLastId(
    ): Promise<number> {
        try {
            return await this.suscripcionesSrv.getLastId();
        } catch (e) {
            console.log('Error al consultar ultimo id');
            console.log(e);
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post()
    @RequirePermission(Permissions.SUSCRIPCIONES.REGISTRAR)
    async create(
        @Body() s: Suscripcion
    ) {
        try {
            await this.suscripcionesSrv.create(s);
        } catch (e) {
            console.log('Error al registrar')
            console.log(e);
            throw new HttpException(
                {
                    request: 'post',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get(':id')
    @RequirePermission(Permissions.SUSCRIPCIONES.CONSULTAR)
    async findById(
        @Param('id') id: number
    ): Promise<Suscripcion> {
        try {
            const s: Suscripcion = await this.suscripcionesSrv.findById(id);
            if (!s) throw new HttpException(
                {
                    request: 'get',
                    description: `No se encontró la suscripción con código ${id}.`
                },
                HttpStatus.NOT_FOUND
            );
            return s;
        } catch (e) {
            console.log('Error al consultar suscripcion por ID');
            console.log(e);
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Put(':id')
    @RequirePermission(Permissions.SUSCRIPCIONES.EDITAR)
    async edit(
        @Param('id') oldId: number, @Body() s: Suscripcion
    ) {
        try {
            if (!(await this.suscripcionesSrv.edit(oldId, s))) throw new HttpException(
                {
                    request: 'put',
                    description: `No se encontró la suscripción con código ${oldId}.`
                },
                HttpStatus.NOT_FOUND
            );
        } catch (e) {
            console.log('Error al editar suscripcion');
            console.log(e);
            throw new HttpException(
                {
                    request: 'put',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Delete(':id')
    @RequirePermission(Permissions.SUSCRIPCIONES.ELIMINAR)
    async delete(
        @Param('id') id: number
    ) {
        try {
            if (!(await this.suscripcionesSrv.delete(id))) throw new HttpException(
                {
                    request: 'delete',
                    description: `No se encontró la suscripción con código ${id}.`
                },
                HttpStatus.NOT_FOUND
            );
        } catch (e) {
            console.log('Error al eliminar suscripcion');
            console.log(e);
            throw new HttpException(
                {
                    request: 'delete',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

}
