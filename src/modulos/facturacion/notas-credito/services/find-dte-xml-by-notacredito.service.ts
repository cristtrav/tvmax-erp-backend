import { DTE } from '@database/entity/facturacion/dte.entity';
import { NotaCredito } from '@database/entity/facturacion/nota-credito.entity';
import { DteView } from '@database/view/facturacion/dte.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FindDteXmlByNotacreditoService {

    constructor(
        @InjectRepository(NotaCredito)
        private notaCreditoRepo: Repository<NotaCredito>,
        @InjectRepository(DTE)
        private dteRepo: Repository<DTE>
    ){}

    async findDteXmlByNota(idnota: number): Promise<string> {
        const nota = await this.notaCreditoRepo.findOneByOrFail({ id: idnota });
        return (await this.dteRepo.findOneByOrFail({ id: nota.iddte })).xml;
    }

}
