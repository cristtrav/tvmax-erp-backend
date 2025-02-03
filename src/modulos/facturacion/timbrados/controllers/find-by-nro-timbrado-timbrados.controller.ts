import { Controller, Get, Param } from '@nestjs/common';
import { FindByNroTimbradoTimbradosService } from '../services/find-by-nro-timbrado-timbrados.service';
import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';
import { TimbradoView } from '@database/view/facturacion/timbrado.view';

@Controller('timbrados')
export class FindByNroTimbradoTimbradosController {

    constructor(
        private service: FindByNroTimbradoTimbradosService
    ){}

    @Get(':nrotimbrado')
    @AllowedIn(Permissions.TIMBRADOS.CONSULTAR)
    getByNroTimbrado(
        @Param('nrotimbrado') nrotimbrado: number
    ): Promise<TimbradoView>{
        return this.service.findByNroTimbrado(nrotimbrado);
    }

}
