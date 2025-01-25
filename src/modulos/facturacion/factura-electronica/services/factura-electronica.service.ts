import { DTE } from '@database/entity/facturacion/dte.entity';
import { FacturaElectronicaView } from '@database/view/facturacion/factura-electronica.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FacturaElectronicaService {

    constructor(
        @InjectRepository(DTE)
        private facturaElectronicaRepo: Repository<DTE>,
        @InjectRepository(FacturaElectronicaView)
        private facturaElectronicaViewRepo: Repository<FacturaElectronicaView>
    ){}

    findDetailsById(idventa: number): Promise<FacturaElectronicaView>{
        return this.facturaElectronicaViewRepo.findOneByOrFail({ idventa })
    }

    findById(id: number): Promise<DTE>{
        return this.facturaElectronicaRepo.findOneByOrFail({ id });
    }

}
