import { Controller, Get, HttpException, HttpStatus, Post, Body, Put, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { Grupo } from './../../dto/grupo.dto';
import { AuthGuard } from './../../global/auth/auth.guard';
import { Permissions } from '../../global/auth/permission.list';
import { RequirePermission } from '../../global/auth/require-permission.decorator';
import { ServerResponseList } from '../../dto/server-response-list.dto';
import { JwtService } from '@nestjs/jwt';
import { Request } from '@nestjs/common';

@Controller('grupos')
@UseGuards(AuthGuard)
export class GruposController {

    constructor(
        private gruposSrv: GruposService,
        private jwtSrv: JwtService
    ) { }

    @Get()
    @RequirePermission(Permissions.GRUPOS.CONSULTAR)
    async findAll(
        @Query('eliminado') eliminado: boolean,
        @Query('sort') sort: string,
        @Query('limit') limit: number,
        @Query('offset') offset: number,
        @Query('id') id: number[] | string[]
    ): Promise<ServerResponseList<Grupo>> {
        try {
            const data: Grupo[] = await this.gruposSrv.findAll({ eliminado, id, sort, limit, offset });
            const rowCount: number = await this.gruposSrv.count({ eliminado, id });
            return new ServerResponseList<Grupo>(data, rowCount);
        } catch (e) {
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Get('total')
    @RequirePermission(Permissions.GRUPOS.CONSULTAR)
    async getTotal(
        @Query('eliminado') eliminado: boolean
    ): Promise<number> {
        try {
            return await this.gruposSrv.count({ eliminado })
        } catch (e) {
            console.log('Error al contar')
            console.log(e)
            throw new HttpException({}, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get(':id')
    @RequirePermission(Permissions.GRUPOS.CONSULTAR)
    async findById(@Param('id') id: number): Promise<Grupo> {
        try {
            return await this.gruposSrv.findById(id);
        } catch (e) {
            throw new HttpException(
                {
                    request: 'get',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Post()
    @RequirePermission(Permissions.GRUPOS.REGISTRAR)
    async create(
        @Body() grupo: Grupo,
        @Req() request: Request
    ) {
        try {
            const authToken: string = request.headers['authorization'].split(" ")[1];
            const idusuario = Number(this.jwtSrv.decode(authToken)['sub']);
            await this.gruposSrv.create(grupo, idusuario);
        } catch (e) {
            console.error('Error al registrar Grupo', e)
            throw new HttpException(
                {
                    request: 'post',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Put(':id')
    @RequirePermission(Permissions.GRUPOS.EDITAR)
    async update(
        @Body() grupo: Grupo,
        @Param('id') idviejo: string,
        @Req() request: Request
    ) {
        try {
            const authToken: string = request.headers['authorization'].split(" ")[1];
            const idusuario = Number(this.jwtSrv.decode(authToken)['sub']);
            const cantEditada = await this.gruposSrv.update(idviejo, grupo, idusuario);
            if (cantEditada === 0) {
                throw new HttpException(
                    {
                        request: 'put',
                        description: `No se encontr?? el Grupo con c??digo ${idviejo}`
                    },
                    HttpStatus.NOT_FOUND
                )
            }
        } catch (e) {
            console.error('Error al modificar Grupo', e);
            throw new HttpException(
                {
                    request: 'put',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    @Delete(':id')
    @RequirePermission(Permissions.GRUPOS.ELIMINAR)
    async delete(
        @Param('id') id: string,
        @Req() request: Request
    ) {
        var cantEliminada = 0;
        try {
            const authToken: string = request.headers['authorization'].split(" ")[1];
            const idusuario = Number(this.jwtSrv.decode(authToken)['sub']);
            cantEliminada = await this.gruposSrv.delete(id, idusuario);
        } catch (e) {
            console.error('Error al eliminar Grupo', e)
            throw new HttpException(
                {
                    request: 'delete',
                    description: e.detail ?? e.error ?? e.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
        if (cantEliminada === 0) {
            throw new HttpException(
                {
                    request: 'delete',
                    description: `No se encontr?? el Grupo con c??digo ${id}`
                },
                HttpStatus.NOT_FOUND
            )
        }
    }
}
