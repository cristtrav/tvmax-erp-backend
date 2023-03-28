export class Permissions {
    static readonly GRUPOS = {
        CONSULTAR: 1,
        REGISTRAR: 2,
        EDITAR: 3,
        ELIMINAR: 4,
        ACCESOMODULO: 5
    }

    static readonly SERVICIOS = {
        CONSULTAR: 20,
        REGISTRAR: 21,
        EDITAR: 22,
        ELIMINAR: 23,
        ACCESOMODULO: 24
    }

    static readonly DEPARTAMENTOS = {
        CONSULTAR: 40,
        REGISTRAR: 41,
        EDITAR: 42, 
        ELIMINAR: 43,
        ACCESOMODULO: 44
    }

    static readonly DISTRITOS = {
        CONSULTAR: 60,
        REGISTRAR: 61,
        EDITAR: 62,
        ELIMINAR: 63,
        ACCESOMODULO: 64
    }

    static readonly BARRIOS = {
        CONSULTAR: 80,
        REGISTRAR: 81,
        EDITAR: 82,
        ELIMINAR: 83,
        ACCESOMODULO: 84
    }

    static readonly TIPOSDOMICILIOS = {
        CONSULTAR: 100,
        REGISTRAR: 101,
        EDITAR: 102,
        ELIMINAR: 103
    }

    static readonly USUARIOS = {
        CONSULTAR: 120,
        REGISTRAR: 121,
        EDITAR: 122,
        ELIMINAR: 123,
        ACCESOMODULO: 124,
        CAMBIARPASS: 125
    }

    static readonly ROLES = {
        CONSULTAR: 140,
        REGISTRAR: 141,
        EDITAR: 142,
        ELIMINAR: 143,
        ACCESOMODULO: 144
    }

    static readonly SUSCRIPCIONES = {
        CONSULTAR: 160,
        REGISTRAR: 161,
        EDITAR: 162,
        ELIMINAR: 163,
        CONTAR: 164,
        ACCESOMODULO: 165
    }

    static readonly CLIENTES = {
        CONSULTAR: 180,
        REGISTRAR: 181,
        EDITAR: 182,
        ELIMINAR: 183,
        ACCESOMODULO: 184
    }

    static readonly DOMICILIOS = {
        CONSULTAR: 200,
        REGISTRAR: 201,
        EDITAR: 202,
        ELIMINAR: 203
    }
    static readonly CUOTAS = {
        CONSULTAR: 220,
        REGISTRAR: 221,
        EDITAR: 222,
        ELIMINAR: 223
    }
    static readonly TIMBRADOS = {
        CONSULTAR: 240,
        REGISTRAR: 241,
        EDITAR: 242,
        ELIMINAR: 243,
        ACCESOMODULO: 244
    }

    static readonly VENTAS = {
        CONSULTAR: 260,
        REGISTRAR: 261,
        EDITAR: 262,
        ELIMINAR: 263,
        ANULAR: 264,
        REVERTIRANUL: 265,
        ACCESOMODULO: 266
    }

    static readonly PERMISOS = {
        CONSULTARMODULOSFUNCIONALIDADES: 280,
        CONSULTARPERMISOSUSUARIO: 281,
        EDITARPERMISOSUSUARIO: 282
    }

    static readonly ESTADISTICAS = {
        CONSULTARSUSCRIPCIONES: 300,
        CONSULTARVENTAS: 301
    }

    static readonly AUDITORIA = {
        CONSULTAREVENTOS: 320,
        ACCESOMODULO: 321
    }

    static readonly FORMATOFACTURA = {
        CONSULTAR: 340,
        REGISTRAR: 341,
        EDITAR: 342,
        ELIMINAR: 343,
        ACCESOMODULO: 344
    }

    static readonly COBROS = {
        CONSULTAR: 360,
        ACCESOMODULO: 361
    }
}