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

    public static getEventoAuditoriaTimbrado(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any): EventoAuditoria{
            return this.getEventoAuditoria(TablasAuditoriaList.TIMBRADOS.id, idusuario, operacion, oldValue, newValue);
    }

    public static getEventoAuditoriaCobro(
        idusuario: number,
        operacion: 'R' | 'M' | 'E',
        oldValue: any,
        newValue: any
    ): EventoAuditoria{
        return this.getEventoAuditoria(TablasAuditoriaList.COBROS.id, idusuario, operacion, oldValue, newValue);
    }

}