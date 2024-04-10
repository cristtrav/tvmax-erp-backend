export class Permissions {
    static readonly GRUPOS = {
        CONSULTAR: 1,
        REGISTRAR: 2,
        EDITAR: 3,
        ELIMINAR: 4,
        ACCESOMODULO: 5,
        ACCESOFORMULARIO: 6,
        CONSULTARULTIMOID: 7
    }

    static readonly SERVICIOS = {
        CONSULTAR: 20,
        REGISTRAR: 21,
        EDITAR: 22,
        ELIMINAR: 23,
        ACCESOMODULO: 24,
        ACCESOFORMULARIO: 25,
        CONSULTARULTIMOID: 26
    }

    static readonly DEPARTAMENTOS = {
        CONSULTAR: 40,
        REGISTRAR: 41,
        EDITAR: 42, 
        ELIMINAR: 43,
        ACCESOMODULO: 44,
        ACCESOFORMULARIO: 45
    }

    static readonly DISTRITOS = {
        CONSULTAR: 60,
        REGISTRAR: 61,
        EDITAR: 62,
        ELIMINAR: 63,
        ACCESOMODULO: 64,
        ACCESOFORMULARIO: 65
    }

    static readonly BARRIOS = {
        CONSULTAR: 80,
        REGISTRAR: 81,
        EDITAR: 82,
        ELIMINAR: 83,
        ACCESOMODULO: 84,
        CONSULTARULTIMOID: 85,
        ACCESOFORMULARIO: 86
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
        CAMBIARPASS: 125,
        ACCESOFORMULARIO: 126
    }

    static readonly ROLES = {
        CONSULTAR: 140,
        REGISTRAR: 141,
        EDITAR: 142,
        ELIMINAR: 143,
        ACCESOMODULO: 144,
        ACCESOFORMULARIO: 145
    }

    static readonly SUSCRIPCIONES = {
        CONSULTAR: 160,
        REGISTRAR: 161,
        EDITAR: 162,
        ELIMINAR: 163,
        CONTAR: 164,
        ACCESOMODULO: 165,
        ACCESOFORMULARIO: 166,
        CONSULTARULTIMOID: 167
    }

    static readonly CLIENTES = {
        CONSULTAR: 180,
        REGISTRAR: 181,
        EDITAR: 182,
        ELIMINAR: 183,
        ACCESOMODULO: 184,
        ACCESOFORMULARIO: 185,
        CONSULTARULTIMOID: 186
    }

    static readonly DOMICILIOS = {
        CONSULTAR: 200,
        REGISTRAR: 201,
        EDITAR: 202,
        ELIMINAR: 203,
        ACCESOFORMULARIO: 204,
        CONSULTARULTIMOID: 205,
        ACCESOMODULO: 206
    }
    static readonly CUOTAS = {
        CONSULTAR: 220,
        REGISTRAR: 221,
        EDITAR: 222,
        ELIMINAR: 223,
        ACCESOFORMULARIO: 224,
        ACCESOMODULO: 225
    }
    static readonly TIMBRADOS = {
        CONSULTAR: 240,
        REGISTRAR: 241,
        EDITAR: 242,
        ELIMINAR: 243,
        ACCESOMODULO: 244,
        ACCESOFORMULARIO: 245,
        CONSULTARULTIMOID: 246
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
        EDITARPERMISOSUSUARIO: 282,
        ACCESOFORMULARIO: 283
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
        ACCESOMODULO: 344,
        ACCESOFORMULARIO: 345
    }

    static readonly COBROS = {
        CONSULTAR: 360,
        ACCESOMODULO: 361
    }

    static readonly SORTEOS = {
        ACCESOMODULO: 400,
        CONSULTAR: 401,
        REGISTRAR: 402,
        EDITAR: 403,
        ELIMINAR: 404,
        ACCESOFORMULARIO: 405,
        CONSULTARULTIMOID: 406,
        REALIZARSORTEO: 407
    }

    static readonly PARTICIPANTESSORTEOS = {
        ACCESOMODULO: 440,
        CONSULTAR: 441,
        AGREGAR: 442,
        ELIMINAR: 443
    }

    static readonly PREMIOSSORTEOS = {
        ACCESOMODULO: 480,
        ACCESOFORMULARIO: 481,
        CONSULTAR: 482,
        REGISTRAR: 483,
        EDITAR: 484,
        ELIMINAR: 485,
        CONSULTARULTIMOID: 486
    }

    static readonly EXCLUSIONESSORTEOS = {
        ACCESOMODULO: 520,
        CONSULTAR: 521,
        AGREGAR: 522,
        ELIMINAR: 523
    }

    static readonly DEPOSITOS  = {
        ACCESOALMODULO: 560,
        CONSULTAR: 561,
        REGISTRAR: 562,
        EDITAR: 563,
        ELIMINAR: 564
    }

    static readonly TIPOSMATERIALES = {
        ACCESOMODULO: 600,
        CONSULTAR: 601,
        REGISTRAR: 602,
        EDITAR: 603,
        ELIMINAR: 604,
        ACCESOFORMULARIO: 605,
        CONSULTARULTIMOID: 606
    }

    static readonly MOVIMIENTOSMATERIALES = {
        ACCESOMODULO: 640,
        CONSULTAR: 641,
        REGISTRAR: 642,
        EDITAR: 643,
        ELIMINAR: 644,
        ACCESOFORMULARIO: 645,
        CONSULTARULTIMOID: 646
    }

    static readonly MATERIALES = {
        ACCESOMODULO: 680,
        CONSULTAR: 681,
        REGISTRAR: 682,
        EDITAR: 683,
        ELIMINAR: 684,
        ACCESOFORMULARIO: 685,
        CONSULTARULTIMOID: 686
    }

    static readonly USUARIOSDEPOSITOS = {
        ACCESOMODULO: 720,
        CONSULTAR: 721,
        REGISTRAR: 722,
        EDITAR: 723,
        ELIMINAR: 724,
        CONSULTARULTIMOID: 725,
        ACCESOFORMULARIO: 726
    }

    static readonly MOTIVOSRECLAMOS = {
        ACCESOMODULO: 760,
        ACCESOALFORMULARIO: 761,
        CONSULTAR: 762,
        REGISTRAR: 763,
        EDITAR: 764,
        ELIMINAR: 765
    }

    static readonly RECLAMOS = {
        ACCESOMODULO: 800,
        ACCESOALFORMULARIO: 801,
        CONSULTAR: 802,
        REGISTRAR: 803,
        EDITAR: 804,
        ELIMINAR: 805
    }

    static readonly ROLESUSUARIOS = {
        ACCESOMODULO: 840,
        CONSULTAR: 841,
        EDITAR: 842
    }

    static readonly POS = {
        ACCESOMODULO: 380
    }

    static readonly PAGOSCLIENTES = {
        ACCESOMODULO: 361,
        CONSULTAR: 360
    }

}