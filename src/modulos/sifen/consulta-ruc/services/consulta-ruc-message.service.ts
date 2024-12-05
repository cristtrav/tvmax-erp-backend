import { Injectable } from '@nestjs/common';
import { RespuestaConsultaRucType } from '../types/respuesta-consulta-ruc.type';
import { DetalleConsultaRucType } from '../types/detalle-ruc.type';

@Injectable()
export class ConsultaRucMessageService {

    public static readonly COD_NO_ENCOTRADO = '0500';
    public static readonly COD_NO_AUTORIZADO = '0501';
    public static readonly COD_ENCONTRADO = '0502';

    buildRespuestaConsulta(data): RespuestaConsultaRucType {
        return {
            codigo: data['ns2:rResEnviConsRUC']['ns2:dCodRes'],
            mensaje: data['ns2:rResEnviConsRUC']['ns2:dMsgRes'],
            detalleRuc: this.buildDetalleConsulta(data['ns2:rResEnviConsRUC']['ns2:xContRUC'])
        }
    }

    private buildDetalleConsulta(data): DetalleConsultaRucType | null{
        if(!data) return null;
        return {
            ruc: data['ns2:dRUCCons'],
            razonSocial: data['ns2:dRazCons'],
            codigoEstado: data['ns2:dCodEstCons'],
            estado: data['ns2:dDesEstCons'],
            facturadorElectronico: data['ns2:dRUCFactElec'] == 'S'
        }
    }
}
