import { DepartamentoDTO } from "@dto/departamento.dto";
import { DistritoDTO } from "@dto/distrito.dto";
import { Departamento } from "./entity/departamento.entity";
import { Distrito } from "./entity/distrito.entity";

export class DTOEntityUtis {

    public static departamentoDtoToEntity(depDTO: DepartamentoDTO): Departamento {
        const departamento: Departamento = new Departamento();
        departamento.id = depDTO.id;
        departamento.descripcion = depDTO.descripcion;
        return departamento;
    }

    public static distritoDtoToEntity(distritoDTO: DistritoDTO): Distrito{
        const distrito: Distrito = new Distrito();
        distrito.id = distritoDTO.id;
        distrito.descripcion = distritoDTO.descripcion;
        distrito.iddepartamento = distritoDTO.iddepartamento;
        return distrito;
    }

}