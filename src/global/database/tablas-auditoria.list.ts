import { TablaAuditoria } from "@dto/tabla-auditoria.dto";

export class TablasAuditoriaList{
    public static GRUPOS: TablaAuditoria = {
        id: 1,
        nombre: 'grupo',
        descripcion: 'Grupos'
    };
    public static SERVICIOS: TablaAuditoria = {
        id: 2,
        nombre: 'servicio',
        descripcion: 'Servicios'
    };
    public static DEPARTAMENTOS: TablaAuditoria = {
        id: 3,
        nombre: 'departamento',
        descripcion: 'Departamentos'
    };
    public static DISTRITOS: TablaAuditoria = {
        id: 4,
        nombre: 'distrito',
        descripcion: 'Distritos'
    };
    public static BARRIOS: TablaAuditoria = {
        id: 5,
        nombre: 'barrio',
        descripcion: 'Barrios'
    };
    public static TIPODOMICILIO: TablaAuditoria = {
        id: 6,
        nombre: 'tipo_domicilio',
        descripcion: 'Tipos de Domicilios'
    };
    public static COBRADORES: TablaAuditoria = {
        id: 7,
        nombre: 'cobrador',
        descripcion: 'Cobradores'
    };
    public static USUARIOS: TablaAuditoria = {
        id: 8,
        nombre: 'usuario',
        descripcion: 'Usuarios'
    };
    public static TIMBRADOS: TablaAuditoria = {
        id: 9,
        nombre: 'timbrado',
        descripcion: 'Timbrados'
    };
    public static FACTURAVENTA: TablaAuditoria = {
        id: 10,
        nombre: 'factura_venta',
        descripcion: 'Facturas Venta'
    };
    public static DETALLEFACTURAVENTA: TablaAuditoria = {
        id: 11,
        nombre: 'detalle_factura_venta',
        descripcion: 'Detalle Factura VEnta'
    };
    public static SUSCRIPCIONES: TablaAuditoria = {
        id: 12,
        nombre: 'suscripcion',
        descripcion: 'Suscripciones'
    };
    public static CLIENTES: TablaAuditoria = {
        id: 13,
        nombre: 'cliente',
        descripcion: 'Clientes'
    };
    public static DOMICILIOS: TablaAuditoria = {
        id: 14,
        nombre: 'domicilio',
        descripcion: 'Domicilios',
    }
    public static CUOTAS: TablaAuditoria = {
        id: 15, 
        nombre: 'cuota',
        descripcion: 'Cuotas'
    }
}