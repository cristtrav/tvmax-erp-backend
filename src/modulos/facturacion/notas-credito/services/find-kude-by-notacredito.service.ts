import { DTE } from '@database/entity/facturacion/dte.entity';
import { NotaCredito } from '@database/entity/facturacion/nota-credito.entity';
import { KudeUtilService } from '@modulos/sifen/sifen-utils/services/kude/kude-util.service';
import { Injectable, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FindKudeByNotacreditoService {

    constructor(
        @InjectRepository(DTE)
        private dteRepo: Repository<DTE>,
        @InjectRepository(NotaCredito)
        private notaCreditoRepo: Repository<NotaCredito>,
        private kudeFacturaUtilSrv: KudeUtilService
    ){}

    async findKudeByNotaCredito(idnota: number): Promise<StreamableFile>{
        const nota = await this.notaCreditoRepo.findOneByOrFail({ id: idnota });
        const dte = await this.dteRepo.findOneByOrFail({ id: nota.iddte });
        return this.kudeFacturaUtilSrv.generateKude(dte);
    }
}
