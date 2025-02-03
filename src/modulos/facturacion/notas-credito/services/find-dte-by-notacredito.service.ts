import { NotaCredito } from '@database/entity/facturacion/nota-credito.entity';
import { DteView } from '@database/view/facturacion/dte.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FindDteByNotacreditoService {

    constructor(
        @InjectRepository(DteView)
        private dteViewRepo: Repository<DteView>,
        @InjectRepository(NotaCredito)
        private notaCreditoRepo: Repository<NotaCredito>
    ){}

    async findDteByNotaCredito(idnota: number): Promise<DteView>{
        const nota = await this.notaCreditoRepo.findOneByOrFail({id: idnota});
        return await this.dteViewRepo.findOneByOrFail({ id: nota.iddte });
    }

}
