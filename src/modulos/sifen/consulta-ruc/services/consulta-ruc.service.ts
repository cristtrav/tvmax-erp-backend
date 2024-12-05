import { SifenApiUtilService } from '@modulos/ventas/service/sifen-api-util.service';
import { Injectable } from '@nestjs/common';
import { ConsultaRucMessageService } from './consulta-ruc-message.service';
import { DetalleConsultaRucType } from '../types/detalle-ruc.type';
import { RespuestaConsultaRucType } from '../types/respuesta-consulta-ruc.type';

@Injectable()
export class ConsultaRucService {

    constructor(
        private sifenApiUtilSrv: SifenApiUtilService,
        private consultaRucMessageSrv: ConsultaRucMessageService
    ){}

    async consultar(documento: string): Promise<RespuestaConsultaRucType>{
        return this.consultaRucMessageSrv.buildRespuestaConsulta(
            await this.sifenApiUtilSrv.consultarRuc(documento)
        );        
    }

}
