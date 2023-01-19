import { BarrioDTO } from "@dto/barrio.dto";
import { CuotaDTO } from "@dto/cuota.dto";
import { DepartamentoDTO } from "@dto/departamento.dto";
import { DistritoDTO } from "@dto/distrito.dto";
import { GrupoDTO } from "@dto/grupo.dto";
import { RolDTO } from "@dto/rol.dto";
import { ServicioDTO } from "@dto/servicio.dto";
import { UsuarioDTO } from "@dto/usuario.dto";
import { Barrio } from "./entity/barrio.entity";
import { Cuota } from "./entity/cuota.entity";
import { Departamento } from "./entity/departamento.entity";
import { Distrito } from "./entity/distrito.entity";
import { Grupo } from "./entity/grupo.entity";
import { Rol } from "./entity/rol.entity";
import { Servicio } from "./entity/servicio.entity";
import { Usuario } from "./entity/usuario.entity";

export class DTOEntityUtis {

    public static departamentoDtoToEntity(depDTO: DepartamentoDTO): Departamento {
        const departamento: Departamento = new Departamento();
        departamento.id = depDTO.id;
        departamento.descripcion = depDTO.descripcion;
        return departamento;
    }

    public static distritoDtoToEntity(distritoDTO: DistritoDTO): Distrito {
        const distrito: Distrito = new Distrito();
        distrito.id = distritoDTO.id;
        distrito.descripcion = distritoDTO.descripcion;
        distrito.iddepartamento = distritoDTO.iddepartamento;
        return distrito;
    }

    public static barrioDtoToEntity(barrioDTO: BarrioDTO): Barrio {
        const barrio: Barrio = new Barrio();
        barrio.id = barrioDTO.id;
        barrio.descripcion = barrioDTO.descripcion;
        barrio.iddistrito = barrioDTO.iddistrito;
        return barrio;
    }

    public static grupoDtoToEntity(grupoDTO: GrupoDTO): Grupo {
        const grupo: Grupo = new Grupo();
        grupo.id = grupoDTO.id;
        grupo.descripcion = grupoDTO.descripcion;
        return grupo;
    }

    public static servicioDtoToEntity(servicioDTO: ServicioDTO): Servicio {
        const servicio: Servicio = new Servicio();
        servicio.id = servicioDTO.id;
        servicio.descripcion = servicioDTO.descripcion;
        servicio.idgrupo = servicioDTO.idgrupo;
        servicio.porcentajeIva = servicioDTO.porcentajeiva;
        servicio.precio = servicioDTO.precio;
        servicio.suscribible = servicioDTO.suscribible;
        return servicio;
    }

    public static cuotaDtoToEntity(cuotaDTO: CuotaDTO): Cuota {
        const cuota: Cuota = new Cuota();
        if (cuotaDTO.id != null) cuota.id = cuotaDTO.id;
        cuota.idservicio = cuotaDTO.idservicio;
        cuota.idsuscripcion = cuotaDTO.idsuscripcion;
        cuota.monto = cuotaDTO.monto;
        cuota.nroCuota = cuotaDTO.nrocuota;
        cuota.observacion = cuotaDTO.observacion;
        cuota.pagado = cuotaDTO.pagado;
        if(cuotaDTO.fechavencimiento != null)
            cuota.fechaVencimiento = new Date(`${cuotaDTO.fechavencimiento}T00:00:00`);
        return cuota;
    }

    public static rolDtoToEntity(rolDTO: RolDTO): Rol{
        const rol: Rol = new Rol();
        rol.id = rolDTO.id;
        rol.descripcion = rolDTO.descripcion;
        if(rolDTO.eliminado != null) rol.eliminado = rolDTO.eliminado;
        return rol;
    }

    public static usuarioDtoToEntity(usuarioDTO: UsuarioDTO): Usuario{
        const usuario: Usuario = new Usuario();
        usuario.id = usuarioDTO.id;
        usuario.nombres = usuarioDTO.nombres;
        usuario.apellidos = usuarioDTO.apellidos;
        usuario.ci = usuarioDTO.ci;
        usuario.email = usuarioDTO.email;
        usuario.telefono = usuarioDTO.telefono;
        usuario.idrol = usuarioDTO.idrol;
        usuario.password = usuarioDTO.password;
        usuario.accesoSistema = usuarioDTO.accesosistema;
        if(usuarioDTO.eliminado != null) usuario.eliminado = usuarioDTO.eliminado;
        return usuario;
    }

}