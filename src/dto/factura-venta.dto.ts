import { DetalleFacturaVenta } from "./detalle-factura-venta-dto";

export class FacturaVenta {
    id: number | null = null;
    cliente: string | null = null;
    ci: number | null = null;
    dvruc: number | null = null;
    total: number = 0;
    pagado: boolean = false;
    anulado: boolean = false;
    totaliva5: number = 0;
    liquidacioniva5: number = 0;
    totaliva10: number = 0;
    liquidacioniva10: number = 0;
    totalexento: number = 0;
    fechafactura: string | null = null;
    idcliente: number | null = null;
    prefijofactura: string | null = null;
    nrofactura: number | null = null;
    idtimbrado: number | null = null;
    timbrado: number | null = null;
    vencimientotimbrado: string | null = null;
    iniciovigenciatimbrado: string | null = null;
    detalles: DetalleFacturaVenta [] = [];
    fechacobro: string | null = null;
    idcobradorcomision: number | null = null;
    cobrador: string | null = null;
    idusuarioregistrofactura: number | null = null;
    nombresusuariofactura: string | null = null;
    apellidosusuariofactura: string | null = null;
    idusuarioregistrocobro: number | null = null;
    nombresusuariocobro: string | null = null;
    apellidosusuariocobro: string | null = null;
}