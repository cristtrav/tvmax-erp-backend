import { Controller, Get, HttpException, HttpStatus, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { Grupo } from './../../dto/grupo.dto';

@Controller('grupos')
export class GruposController {

    constructor(
        private gruposSrv: GruposService
    ){ }

    @Get()
    async findAll(): Promise<Grupo[]> {
        try{
            return await this.gruposSrv.findAll()
        }catch(e){
            throw new HttpException(e.detail ?? e.error ?? e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Post()
    async create(@Body() grupo: Grupo){
        try{
            await this.gruposSrv.create(grupo)
        }catch(e){
            console.error('Error al registrar Grupo', e)
            throw new HttpException(e.detail ?? e.error ?? e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Put(':id')
    async update(@Body() grupo: Grupo, @Param('id') idviejo: string){
        var cantEditada = 0
        try{
            const cantEditada = await this.gruposSrv.update(idviejo, grupo);
        }catch(e){
            console.error('Error al modificar Grupo', e);
            throw new HttpException(e.detail ?? e.error ?? e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
        if(cantEditada  === 0){
            throw new HttpException(`No se encontró el Grupo con código ${idviejo}`, HttpStatus.NOT_FOUND)
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string){
        var cantEliminada = 0
        try{
            cantEliminada = await this.gruposSrv.delete(id)
        }catch(e){
            console.error('Error al eliminar Grupo', e)
            throw new HttpException(e.detail ?? e.error ?? e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
        if(cantEliminada === 0) {
            throw new HttpException(`No se encontró el Grupo con código ${id}`, HttpStatus.NOT_FOUND)
        }
    }
}
