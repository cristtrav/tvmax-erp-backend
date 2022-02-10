import { DetalleFacturaVenta } from "./detalle-factura-venta-dto";

export class FacturaVenta {
    id: number | null = null;
    cliente: string | null = null;
    total: number = 0;
    pagado: boolean = false;
    anulado: boolean = false;
    iva5: number = 0;
    iva10: number = 0;
    exento: number = 0;
    fechafactura: string | null = null;
    idcliente: number | null = null;
    prefijofactura: string | null = null;
    nrofactura: number | null = null;
    idtimbrado: number | null = null;
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