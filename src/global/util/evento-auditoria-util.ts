import { EventoAuditoria } from "@database/entity/evento-auditoria.entity";
import { TablasAuditoriaList } from "@database/tablas-auditoria.list";

export class EventoAuditoriaUtil{

    public static getEventoAuditoria(
        idtabla: number,
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any): EventoAuditoria {
        const evento = new EventoAuditoria();
        evento.idtabla = idtabla;
        evento.fechahora = new Date();
        evento.idusuario = idusuario;
        evento.operacion = operacion;
        evento.estadoanterior = oldValue;
        evento.estadonuevo = newValue;
        return evento;
    }

    public static getEventoAuditoriaVenta(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any): EventoAuditoria{
            return this.getEventoAuditoria(TablasAuditoriaList.VENTA.id, idusuario, operacion, oldValue, newValue);
    }

    public static getEventoAuditoriaDetalleVenta(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any): EventoAuditoria{
            return this.getEventoAuditoria(TablasAuditoriaList.DETALLEVENTA.id, idusuario, operacion, oldValue, newValue);
    }

    public static getEventoAuditoriaCuota(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any): EventoAuditoria{
            return this.getEventoAuditoria(TablasAuditoriaList.CUOTAS.id, idusuario, operacion, oldValue, newValue);
    }

    public static getEventoAuditoriaCobro(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any
    ): EventoAuditoria{
        return this.getEventoAuditoria(TablasAuditoriaList.COBROS.id, idusuario, operacion, oldValue, newValue);
    }

    public static getEventoAuditoriaUsuario(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any
    ): EventoAuditoria{
        return this.getEventoAuditoria(TablasAuditoriaList.USUARIOS.id, idusuario, operacion, oldValue, newValue);
    };

    public static getEventoAuditoriaPermisos(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any
    ): EventoAuditoria{
        return this.getEventoAuditoria(TablasAuditoriaList.PERMISOS.id, idusuario, operacion, oldValue, newValue);
    };

    public static getEventoAuditoriaFormatosFacturas(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any
    ){
        return this.getEventoAuditoria(TablasAuditoriaList.FORMATOSFACTURAS.id, idusuario, operacion, oldValue, newValue);
    }

    public static getEventoAuditoriaTiposMateriales(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any
    ){
        return this.getEventoAuditoria(TablasAuditoriaList.TIPOMATERIAL.id, idusuario, operacion, oldValue, newValue);
    }

    public static getEventoAuditoriaMaterial(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any
    ){
        return this.getEventoAuditoria(TablasAuditoriaList.MATERIAL.id, idusuario, operacion, oldValue, newValue);
    }

    public static getEventoAuditoriaMovimientoMaterial(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any
    ){
        return this.getEventoAuditoria(TablasAuditoriaList.MOVIMIENTOMATERIAL.id, idusuario, operacion, oldValue, newValue);
    }

    public static getEventoAuditoriaDetalleMovimientoMaterial(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any
    ){
        return this.getEventoAuditoria(TablasAuditoriaList.DETALLEMOVIMIENTOMATERIAL.id, idusuario, operacion, oldValue, newValue);
    }

    public static getEventoAuditoriaExistencia(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any
    ){
        return this.getEventoAuditoria(TablasAuditoriaList.EXISTENCIA.id, idusuario, operacion, oldValue, newValue);
    }

    public static getEventoAuditoriaUsuarioDeposito(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any
    ){
        return this.getEventoAuditoria(TablasAuditoriaList.USUARIODEPOSITO.id, idusuario, operacion, oldValue, newValue);
    }

    public static getEventoAuditoriaSorteos(
        idusuario: number,
        operacion: OperacionType,
        oldValue: any,
        newValue: any
    ){
        return this.getEventoAuditoria(TablasAuditoriaList.SORTEOS.id, idusuario, operacion, oldValue, newValue);
    }

    public static getEventoAuditoriaPremios(
        idusuario: number,
        operacion: OperacionType,
        oldValue: any,
        newValue: any
    ){
        return this.getEventoAuditoria(TablasAuditoriaList.PREMIOS.id, idusuario, operacion, oldValue, newValue);
    }

}

type OperacionType = 'R' | 'M' | 'E';