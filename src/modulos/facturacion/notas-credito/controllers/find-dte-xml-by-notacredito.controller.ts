import { AllowedIn } from '@auth/decorators/allowed-in.decorator';
import { Permissions } from '@auth/permission.list';
import { Controller, Get, Header, Param, StreamableFile } from '@nestjs/common';
import { FindDteXmlByNotacreditoService } from '../services/find-dte-xml-by-notacredito.service';

@Controller('notascredito')
export class FindDteXmlByNotacreditoController {

    constructor(
        private findDteXmlByNotaSrv: FindDteXmlByNotacreditoService
    ){}

    @Get(':id/dte-xml')
    @AllowedIn(Permissions.NOTASCREDITO.CONSULTAR)
    @Header('content-type', 'text/xml')
    async getDTEById(
        @Param('id') id: number
    ): Promise<StreamableFile> {
        const xml = await this.findDteXmlByNotaSrv.findDteXmlByNota(id);
        return new StreamableFile(Buffer.from(xml, 'utf-8'));
    }
    
}
