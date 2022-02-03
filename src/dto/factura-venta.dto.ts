import { DetalleFacturaVenta } from "./detalle-factura-venta-dto";
import { Cobro } from "./cobro.dto"

export class FacturaVenta {
    id: number | null = null;
    cliente: string  | null = null;
    total: number = 0;
    pagado: boolean = false;
    anulado: boolean = false;
    iva5: number = 0;
    iva10: number = 0;
    exento: number = 0;
    fecha: string | null = null;
    idcliente: number | null = null;
    nrofactura: number | null = null;
    prefijofactura: string | null = null;
    idtimbrado: number | null = null;
    detalles: DetalleFacturaVenta [] = [];
    cobros: Cobro [] = [];
}