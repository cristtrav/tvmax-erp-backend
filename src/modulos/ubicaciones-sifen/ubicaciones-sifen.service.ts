import { Injectable } from '@nestjs/common';
import * as departamentos from './json/departamentos-sifen.json';
import * as distritos from './json/distritos-sifen.json';
import * as ciudades from './json/ciudades-sifen.json';
import { DepartamentoSifenType } from './types/departamento-sifen.type';
import { DistritoSifenType } from './types/distrito-sifen.type';
import { CiudadSifenType } from './types/ciudad-sifen.type';

@Injectable()
export class UbicacionesSifenService {

    public findAllDepartamentos(): DepartamentoSifenType[]{
        return departamentos;
    }

    public findDistritosByDepartamento(codDepartamento: number): DistritoSifenType[] {
        return distritos.filter(d => d.codDepartamento == codDepartamento);
    }

    public findCiudadesByDistrito(codDistrito: number): CiudadSifenType[]{      
        return ciudades
            .filter(c => c.codDistrito == codDistrito)
            .map(c => {
                return {
                    codDistrito: c.codDistrito,
                    codCiudad: c.codCiudad,
                    ciudad: `${c.ciudad}`
                }
            })
    }

    findDepartamentoById(codDepartamento: number): DepartamentoSifenType | undefined{
        return departamentos.find(d => d.codDepartamento == codDepartamento);
    }

    findDistritoById(codDistrito: number): DistritoSifenType | undefined{
        return distritos.find(d => d.codDistrito == codDistrito);
    }

    findCiudadById(codCiudad: number): CiudadSifenType | undefined {
        const ciudad = ciudades.find(c => c.codCiudad == codCiudad);
        if(!ciudad) return undefined;
        return { ...ciudad, ciudad: `${ciudad.ciudad}`}
    }

}
