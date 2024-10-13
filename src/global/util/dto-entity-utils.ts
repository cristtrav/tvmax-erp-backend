import { FormatoFactura } from "@database/entity/formato-factura.entity";
import { BarrioDTO } from "src/global/dto/barrio.dto";
import { ClienteDTO } from "src/global/dto/cliente.dto";
import { CuotaDTO } from "src/global/dto/cuota.dto";
import { DepartamentoDTO } from "src/global/dto/departamento.dto";
import { DetalleVentaDTO } from "src/global/dto/detalle-venta-dto";
import { DistritoDTO } from "src/global/dto/distrito.dto";
import { DomicilioDTO } from "src/global/dto/domicilio.dto";
import { FormatoFacturaDTO } from "src/global/dto/formato-factura.dto";
import { GrupoDTO } from "src/global/dto/grupo.dto";
import { RolDTO } from "src/global/dto/rol.dto";
import { ServicioDTO } from "src/global/dto/servicio.dto";
import { SuscripcionDTO } from "src/global/dto/suscripcion.dto";
import { TimbradoDTO } from "src/global/dto/timbrado.dto";
import { UsuarioDTO } from "src/global/dto/usuario.dto";
import { VentaDTO } from "src/global/dto/venta.dto";
import { Barrio } from "../database/entity/barrio.entity";
import { Cliente } from "../database/entity/cliente.entity";
import { Cuota } from "../database/entity/cuota.entity";
import { Departamento } from "../database/entity/departamento.entity";
import { DetalleVenta } from "../database/entity/detalle-venta.entity";
import { Distrito } from "../database/entity/distrito.entity";
import { Domicilio } from "../database/entity/domicilio.entity";
import { Grupo } from "../database/entity/grupo.entity";
import { Rol } from "../database/entity/rol.entity";
import { Servicio } from "../database/entity/servicio.entity";
import { Suscripcion } from "../database/entity/suscripcion.entity";
import { Timbrado } from "../database/entity/timbrado.entity";
import { Usuario } from "../database/entity/usuario.entity";
import { Venta } from "../database/entity/venta.entity";
import { Sorteo } from "@database/entity/sorteos/sorteo.entity";
import { Premio } from "@database/entity/sorteos/premio.entity";
import { Material } from "@database/entity/depositos/material.entity";
import { DetalleMovimientoMaterial } from "@database/entity/depositos/detalle-movimiento-material.entity";
import { MovimientoMaterial } from "@database/entity/depositos/movimiento-material.entity";
import { TipoMaterial } from "@database/entity/depositos/tipo-material.entity";
import { DetalleMovimientoMaterialDTO } from "@dto/depositos/detalle-movimiento-material.dto";
import { MaterialDTO } from "@dto/depositos/material.dto";
import { MovimientoMaterialDTO } from "@dto/depositos/movimiento-material.dto";
import { TipoMaterialDTO } from "@dto/depositos/tipo-material.dto";
import { PremioDTO } from "@dto/sorteos/premio.dto";
import { SorteoDTO } from "@dto/sorteos/sorteo.dto";

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
        if (cuotaDTO.fechavencimiento != null)
            cuota.fechaVencimiento = new Date(`${cuotaDTO.fechavencimiento}T00:00:00`);
        return cuota;
    }

    public static rolDtoToEntity(rolDTO: RolDTO): Rol {
        const rol: Rol = new Rol();
        rol.id = rolDTO.id;
        rol.descripcion = rolDTO.descripcion;
        if (rolDTO.eliminado != null) rol.eliminado = rolDTO.eliminado;
        return rol;
    }

    public static usuarioDtoToEntity(usuarioDTO: UsuarioDTO): Usuario {
        const usuario: Usuario = new Usuario();
        usuario.id = usuarioDTO.id;
        usuario.nombres = usuarioDTO.nombres;
        usuario.apellidos = usuarioDTO.apellidos;
        usuario.ci = usuarioDTO.ci;
        usuario.email = usuarioDTO.email;
        usuario.telefono = usuarioDTO.telefono;        
        usuario.password = usuarioDTO.password;
        usuario.accesoSistema = usuarioDTO.accesosistema;
        return usuario;
    }

    public static timbradoDtoToEntity(timbradoDTO: TimbradoDTO): Timbrado {
        const timbrado: Timbrado = new Timbrado();
        timbrado.id = timbradoDTO.id;
        timbrado.codEstablecimiento = timbradoDTO.codestablecimiento;
        timbrado.codPuntoEmision = timbradoDTO.codpuntoemision;
        timbrado.fechaInicioVigencia = new Date(`${timbradoDTO.fechainicio}T00:00:00`);
        if (timbradoDTO.fechavencimiento) timbrado.fechaVencimiento = new Date(`${timbradoDTO.fechavencimiento}T00:00:00`);
        timbrado.nroInicio = timbradoDTO.nroinicio;
        if (timbradoDTO.nrofin) timbrado.nroFin = timbradoDTO.nrofin;
        timbrado.nroTimbrado = timbradoDTO.nrotimbrado;
        timbrado.ultimoNroUsado = timbradoDTO.ultnrousado;
        timbrado.activo = timbradoDTO.activo;
        timbrado.idformatoFactura = timbradoDTO.idformatofactura;
        timbrado.electronico = timbradoDTO.electronico;
        return timbrado;
    }

    public static clienteDtoToEntity(clienteDto: ClienteDTO): Cliente {
        const cliente = new Cliente();
        cliente.id = clienteDto.id;
        cliente.nombres = clienteDto.nombres;
        cliente.apellidos = clienteDto.apellidos;
        cliente.razonSocial = clienteDto.razonsocial;
        cliente.telefono1 = clienteDto.telefono1;
        cliente.telefono2 = clienteDto.telefono2;
        cliente.email = clienteDto.email;
        cliente.idcobrador = clienteDto.idcobrador;
        cliente.dvRuc = clienteDto.dvruc;
        cliente.ci = clienteDto.ci;
        if(clienteDto.eliminado != null) cliente.eliminado = clienteDto.eliminado;
        if(clienteDto.excluidosorteo != null) cliente.excluidoSorteo = clienteDto.excluidosorteo;
        return cliente;
    }

    public static domicilioDtoToEntity(domicilioDto: DomicilioDTO): Domicilio {        
        const domicilio = new Domicilio();
        domicilio.id = domicilioDto.id;
        domicilio.direccion = domicilioDto.direccion;
        domicilio.idbarrio = domicilioDto.idbarrio;
        domicilio.idcliente = domicilioDto.idcliente;
        domicilio.nroMedidor = domicilioDto.nromedidor;
        domicilio.observacion = domicilioDto.observacion;
        domicilio.principal = domicilioDto.principal;
        domicilio.tipo = domicilioDto.tipo;
        domicilio.eliminado = domicilioDto.eliminado;
        if(domicilioDto.latitud != null && domicilioDto.longitud != null)
            domicilio.ubicacion = {x: domicilioDto.latitud, y: domicilioDto.longitud};
        else domicilio.ubicacion = null;        
        return domicilio;
    }

    public static suscripcionDtoToEntity(suscripcionDto: SuscripcionDTO): Suscripcion {
        const suscripcion = new Suscripcion();
        suscripcion.id = suscripcionDto.id;
        suscripcion.estado = suscripcionDto.estado;
        if (suscripcionDto.fechacambioestado) suscripcion.fechaCambioEstado = new Date(`${suscripcionDto.fechacambioestado}T00:00:00`);
        if (suscripcionDto.fechasuscripcion) suscripcion.fechaSuscripcion = new Date(`${suscripcionDto.fechasuscripcion}T00:00:00`);
        suscripcion.idcliente = suscripcionDto.idcliente;
        suscripcion.iddomicilio = suscripcionDto.iddomicilio;
        suscripcion.idservicio = suscripcionDto.idservicio;
        suscripcion.monto = suscripcionDto.monto;
        suscripcion.eliminado = suscripcionDto.eliminado;
        suscripcion.gentileza = suscripcionDto.gentileza;
        suscripcion.observacion = suscripcionDto.observacion;
        return suscripcion;
    }

    public static ventaDtoToEntity(ventaDto: VentaDTO): Venta{
        const venta = new Venta();
        if(ventaDto.id != null) venta.id = ventaDto.id;
        venta.anulado = ventaDto.anulado;
        venta.pagado = ventaDto.pagado;
        venta.eliminado = ventaDto.eliminado;
        venta.fechaFactura = ventaDto.fechafactura;
        venta.idcliente = ventaDto.idcliente;
        venta.idtimbrado = ventaDto.idtimbrado;
        venta.idusuarioRegistroFactura = ventaDto.idusuarioregistrofactura;
        venta.nroFactura = ventaDto.nrofactura;
        venta.total = ventaDto.total;
        venta.totalExentoIva = ventaDto.totalexentoiva;
        venta.totalGravadoIva10 = ventaDto.totalgravadoiva10;
        venta.totalGravadoIva5 = ventaDto.totalgravadoiva5;
        venta.totalIva10 = ventaDto.totaliva10;
        venta.totalIva5 = ventaDto.totaliva5;
        return venta;
    }

    public static detalleVentaDtoToEntity(detalleVentaDto: DetalleVentaDTO): DetalleVenta{
        const detalleVenta = new DetalleVenta();
        if(detalleVentaDto.id != null) detalleVenta.id = detalleVentaDto.id;
        detalleVenta.cantidad = detalleVentaDto.cantidad;
        detalleVenta.descripcion = detalleVentaDto.descripcion;
        detalleVenta.idcuota = detalleVentaDto.idcuota;
        detalleVenta.idservicio = detalleVentaDto.idservicio;
        detalleVenta.idsuscripcion = detalleVentaDto.idsuscripcion;
        //detalleVenta.idventa = detalleVentaDto.idventa;
        detalleVenta.monto = detalleVentaDto.monto;
        detalleVenta.montoIva = detalleVentaDto.montoiva;
        detalleVenta.porcentajeIva = detalleVentaDto.porcentajeiva;
        detalleVenta.subtotal = detalleVentaDto.subtotal;
        return detalleVenta;
    }

    public static formatoFacturaDtoToEntity(formatoFacturaDto: FormatoFacturaDTO): FormatoFactura{
        const formatoFactura = new FormatoFactura();
        formatoFactura.descripcion = formatoFacturaDto.descripcion;
        formatoFactura.parametros = formatoFacturaDto.parametros;
        formatoFactura.plantilla = formatoFacturaDto.plantilla;
        formatoFactura.tipoFactura = formatoFacturaDto.tipoFactura;
        formatoFactura.eliminado = formatoFacturaDto.eliminado;
        return formatoFactura;
    }

    public static sorteoDtoToEntity(sorteoDto: SorteoDTO): Sorteo{
        const sorteo = new Sorteo();
        sorteo.id = sorteoDto.id;
        sorteo.descripcion = sorteoDto.descripcion;
        sorteo.eliminado = sorteoDto.eliminado;
        return sorteo;
    }

    public static premioDtoToEntity(premioDto: PremioDTO): Premio{
        const premio = new Premio();
        premio.id = premioDto.id;
        premio.descripcion = premioDto.descripcion;
        premio.nroPremio = premioDto.nropremio;
        premio.idsorteo = premioDto.idsorteo;
        premio.idclienteGanador = premioDto.idclienteganador;
        premio.eliminado = premioDto.eliminado;
        return premio;
    }

    public static tipoMaterialDTOtoEntity(tmDto: TipoMaterialDTO): TipoMaterial{
        const tipoMaterial = new TipoMaterial();
        tipoMaterial.id = tmDto.id;
        tipoMaterial.descripcion = tmDto.descripcion;
        tipoMaterial.eliminado = false;
        return tipoMaterial;
    }

    public static materialDTOtoEntity(m: MaterialDTO): Material{
        const material = new Material()
        material.id = m.id;
        material.descripcion = m.descripcion;
        material.unidadMedida = m.unidadmedida;
        material.idtipoMaterial = m.idtipomaterial;
        material.soloLectura = m.sololectura;
        material.identificable = m.identificable;
        material.eliminado = m.eliminado;
        material.ultimoPrecio = m.ultimoprecio;
        return material;
    }

    public static movimientoMaterialDTOtoEntity(m: MovimientoMaterialDTO): MovimientoMaterial{
        const movimiento = new MovimientoMaterial();
        movimiento.id = m.id;
        movimiento.fecha = m.fecha;
        movimiento.idmovimientoReferencia = m.idmovimientoreferencia;
        movimiento.idusuarioEntrega = m.idusuarioentrega;
        movimiento.idusuarioResponsable = m.idusuarioresponsable;
        movimiento.observacion = m.observacion;
        if(m.tipomovimiento == 'EN') movimiento.tipoMovimiento = 'EN';
        if(m.tipomovimiento == 'SA') movimiento.tipoMovimiento = 'SA';
        if(m.tipomovimiento == 'AJ') movimiento.tipoMovimiento = 'AJ';
        if(m.tipomovimiento == 'DE') movimiento.tipoMovimiento = 'DE';
        movimiento.eliminado = false;
        movimiento.devuelto = m.devuelto;
        return movimiento;
    }

    public static detalleMovimientoMaterialDTOtoEntity(d: DetalleMovimientoMaterialDTO): DetalleMovimientoMaterial{
        const detalle = new DetalleMovimientoMaterial();
        detalle.id = d.id;
        detalle.cantidad = d.cantidad;
        detalle.cantidadAnterior = d.cantidadanterior;
        detalle.idmovimientoMaterial = d.idmovimiento;
        detalle.idmaterial = d.idmaterial;
        detalle.descripcion = d.descripcion;
        detalle.iddetalleMovimientoReferencia = d.iddetallemovimientoreferencia;
        detalle.nroSerieMaterial = d.nroseriematerial;
        detalle.eliminado = d.eliminado;
        return detalle;
    }

}