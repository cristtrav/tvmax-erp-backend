import { SifenApiUtilService } from '@modulos/sifen/sifen-utils/services/sifen/sifen-api-util.service';
import { Injectable } from '@nestjs/common';
import { ConsultaRucMessageService } from './consulta-ruc-message.service';
import { DetalleConsultaRucInterface } from '../../interfaces/consultas/detalle-ruc.interface';
import { RespuestaConsultaRucInterface } from '../../interfaces/consultas/respuesta-consulta-ruc.interface';

@Injectable()
export class ConsultaRucService {

    constructor(
        private sifenApiUtilSrv: SifenApiUtilService,
        private consultaRucMessageSrv: ConsultaRucMessageService
    ){}

    async consultar(documento: string): Promise<RespuestaConsultaRucInterface>{
        return this.consultaRucMessageSrv.buildRespuestaConsulta(
            await this.sifenApiUtilSrv.consultarRuc(documento)
        );        
    }

}
