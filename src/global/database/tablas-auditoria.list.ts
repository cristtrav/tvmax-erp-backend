import { TablaAuditoriaDTO } from "@dto/tabla-auditoria.dto";

export class TablasAuditoriaList{
    public static GRUPOS: TablaAuditoriaDTO = {
        id: 1,
        nombre: 'grupo',
        descripcion: 'Grupos'
    };
    public static SERVICIOS: TablaAuditoriaDTO = {
        id: 2,
        nombre: 'servicio',
        descripcion: 'Servicios'
    };
    public static DEPARTAMENTOS: TablaAuditoriaDTO = {
        id: 3,
        nombre: 'departamento',
        descripcion: 'Departamentos'
    };
    public static DISTRITOS: TablaAuditoriaDTO = {
        id: 4,
        nombre: 'distrito',
        descripcion: 'Distritos'
    };
    public static BARRIOS: TablaAuditoriaDTO = {
        id: 5,
        nombre: 'barrio',
        descripcion: 'Barrios'
    };
    public static TIPODOMICILIO: TablaAuditoriaDTO = {
        id: 6,
        nombre: 'tipo_domicilio',
        descripcion: 'Tipos de Domicilios'
    };
    public static COBRADORES: TablaAuditoriaDTO = {
        id: 7,
        nombre: 'cobrador',
        descripcion: 'Cobradores'
    };
    public static USUARIOS: TablaAuditoriaDTO = {
        id: 8,
        nombre: 'usuario',
        descripcion: 'Usuarios'
    };
    public static TIMBRADOS: TablaAuditoriaDTO = {
        id: 9,
        nombre: 'timbrado',
        descripcion: 'Timbrados'
    };
    public static VENTA: TablaAuditoriaDTO = {
        id: 10,
        nombre: 'venta',
        descripcion: 'Ventas'
    };
    public static DETALLEVENTA: TablaAuditoriaDTO = {
        id: 11,
        nombre: 'detalle_venta',
        descripcion: 'Detalles Venta'
    };
    public static SUSCRIPCIONES: TablaAuditoriaDTO = {
        id: 12,
        nombre: 'suscripcion',
        descripcion: 'Suscripciones'
    };
    public static CLIENTES: TablaAuditoriaDTO = {
        id: 13,
        nombre: 'cliente',
        descripcion: 'Clientes'
    };
    public static DOMICILIOS: TablaAuditoriaDTO = {
        id: 14,
        nombre: 'domicilio',
        descripcion: 'Domicilios',
    }
    public static CUOTAS: TablaAuditoriaDTO = {
        id: 15, 
        nombre: 'cuota',
        descripcion: 'Cuotas'
    }

    public static COBROS: TablaAuditoriaDTO = {
        id: 16,
        nombre: 'cobros',
        descripcion: 'Cobros'
    }

    public static PERMISOS: TablaAuditoriaDTO = {
        id: 17,
        nombre: 'permisos',
        descripcion: 'permisos'
    }
}