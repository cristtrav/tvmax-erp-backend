import { DetalleProcesamientoDEType } from '@modulos/sifen/sifen-utils/types/lotes/detalle-procesamiento-de.type';
import { ResultadoProcesamientoDEType } from '@modulos/sifen/sifen-utils/types/lotes/resultado-procesamiento-de.type';
import { ResultadoProcesamientoLoteType } from '@modulos/sifen/sifen-utils/types/lotes/resultado-procesamiento-lote.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsultaLoteMessageService {

    public static readonly COD_LOTE_ACEPTADO = '0300';
    public static readonly COD_LOTE_RECHAZADO = '0301'

    public static readonly COD_LOTE_INEXISTENTE = '0360'
    public static readonly COD_LOTE_EN_PROCESO = '0361';
    public static readonly COD_LOTE_FINALIZADO = '0362';

    public isLoteAceptadoEnvio(response): boolean{
        return response['ns2:rResEnviLoteDe']['ns2:dCodRes'] == ConsultaLoteMessageService.COD_LOTE_ACEPTADO;
    }

    public getCodigoRespuestaEnvio(response): string {
        return response['ns2:rResEnviLoteDe']['ns2:dCodRes'];
    }

    public getMensajeEstadoEnvio(response): string{
        return response['ns2:rResEnviLoteDe']['ns2:dMsgRes'];
    }

    public getNroLoteSifenEnvio(response): string | null {
        return response['ns2:rResEnviLoteDe']['ns2:dProtConsLote'];
    }

    public getResumenEnvio(response): string{
        return `${this.getCodigoRespuestaEnvio(response)} - ${this.getMensajeEstadoEnvio(response)}`;
    }

    private buildDetalleProcesamientoDE(data): DetalleProcesamientoDEType{
        return {
            codigo: data['ns2:dCodRes'],
            mensaje: data['ns2:dMsgRes']
        }
    }

    private buildResultadoProcesamientoDE(data): ResultadoProcesamientoDEType{
        return {
            cdc: data['ns2:id'],
            codTransaccion: data['ns2:dProtAut'],
            estado: data['ns2:dEstRes'],
            detalle: this.buildDetalleProcesamientoDE(data['ns2:gResProc'])
        }
    }

    public buildResultadoProcesamientoLote(data): ResultadoProcesamientoLoteType{
        const fechaStr = data['ns2:rResEnviConsLoteDe']['ns2:dFecProc'];
        const resultadoLote = data['ns2:rResEnviConsLoteDe']['ns2:gResProcLote'];
        return {
            idlote: data['id'],
            codigo: data['ns2:rResEnviConsLoteDe']['ns2:dCodResLot'],
            fecha: fechaStr != null && (<string>fechaStr).length > 0 ? new Date(fechaStr) : null,
            mensaje: data['ns2:rResEnviConsLoteDe']['ns2:dMsgResLot'],
            resultados: 
                resultadoLote != null ?
                (Array.isArray(resultadoLote) ? resultadoLote : [resultadoLote]).map(res => this.buildResultadoProcesamientoDE(res)) :
                []
        }
    }

}
