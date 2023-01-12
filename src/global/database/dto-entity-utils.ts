import { BarrioDTO } from "@dto/barrio.dto";
import { DepartamentoDTO } from "@dto/departamento.dto";
import { DistritoDTO } from "@dto/distrito.dto";
import { GrupoDTO } from "@dto/grupo.dto";
import { ServicioDTO } from "@dto/servicio.dto";
import { Barrio } from "./entity/barrio.entity";
import { Departamento } from "./entity/departamento.entity";
import { Distrito } from "./entity/distrito.entity";
import { Grupo } from "./entity/grupo.entity";
import { Servicio } from "./entity/servicio.entity";

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

    public static barrioDtoToEntity(barrioDTO: BarrioDTO): Barrio{
        const barrio: Barrio = new Barrio();
        barrio.id = barrioDTO.id;
        barrio.descripcion = barrioDTO.descripcion;
        barrio.iddistrito = barrioDTO.iddistrito;
        return barrio;
    }

    public static grupoDtoToEntity(grupoDTO: GrupoDTO): Grupo{
        const grupo: Grupo = new Grupo();
        grupo.id = grupoDTO.id;
        grupo.descripcion = grupoDTO.descripcion;
        return grupo;
    }

    public static servicioDtoToEntity(servicioDTO: ServicioDTO): Servicio{
        const servicio: Servicio = new Servicio();
        servicio.id = servicioDTO.id;
        servicio.descripcion = servicioDTO.descripcion;
        servicio.idgrupo = servicioDTO.idgrupo;
        servicio.porcentajeIva = servicioDTO.porcentajeiva;
        servicio.precio = servicioDTO.precio;
        servicio.suscribible = servicioDTO.suscribible;
        return servicio;
    }

}