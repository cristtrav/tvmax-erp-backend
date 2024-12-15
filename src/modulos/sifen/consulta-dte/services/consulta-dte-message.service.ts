import { Injectable } from '@nestjs/common';
import { ConsultaDTEResponse } from '../interfaces/consulta-dte-response.interface';

@Injectable()
export class ConsultaDTEMessageService {

    public static readonly COD_NO_ENCONTRADO = '0420';
    public static readonly COD_NO_AUTORIZADO = '0421';
    public static readonly COD_ENCONTRADO = '0422';

    buildRespuesta(data): ConsultaDTEResponse{
        return {
            fecha: data['ns2:rEnviConsDeResponse']['ns2:dFecProc'],
            codigo: data['ns2:rEnviConsDeResponse']['ns2:dCodRes'],
            mensaje: data['ns2:rEnviConsDeResponse']['ns2:dMsgRes'],
            documento: data['ns2:rEnviConsDeResponse']['ns2:xContenDE']
        }
    }

}
