import { Controller, Get, Param, Query } from '@nestjs/common';
import { UbicacionesSifenService } from './ubicaciones-sifen.service';
import { DepartamentoSifenType } from './types/departamento-sifen.type';
import { DistritoSifenType } from './types/distrito-sifen.type';
import { CiudadSifenType } from './types/ciudad-sifen.type';

@Controller('ubicacionessifen')
export class UbicacionesSifenController {

    constructor(
        private ubicacionesSifenSrv: UbicacionesSifenService
    ){}

    @Get('departamentos')
    findAllDepartamentos(): DepartamentoSifenType[]{
        return this.ubicacionesSifenSrv.findAllDepartamentos();
    }

    @Get('departamentos/:codDepartamento/distritos')
    findDistritosByDepartamento(
        @Param('codDepartamento') codDepartamento: number
    ): DistritoSifenType[]{
        return this.ubicacionesSifenSrv.findDistritosByDepartamento(codDepartamento);
    }

    @Get('distritos/:codDistrito/ciudades')
    findCiudadesByDistrito(
        @Param('codDistrito') codDistrito: number
    ): CiudadSifenType[]{
        return this.ubicacionesSifenSrv.findCiudadesByDistrito(codDistrito);
    }

}
