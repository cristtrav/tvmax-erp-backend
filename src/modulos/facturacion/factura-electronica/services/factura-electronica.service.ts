import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { FacturaElectronicaView } from '@database/view/facturacion/factura-electronica.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FacturaElectronicaService {

    constructor(
        @InjectRepository(FacturaElectronica)
        private facturaElectronicaRepo: Repository<FacturaElectronica>,
        @InjectRepository(FacturaElectronicaView)
        private facturaElectronicaViewRepo: Repository<FacturaElectronicaView>
    ){}

    findDetailsById(idventa: number): Promise<FacturaElectronicaView>{
        return this.facturaElectronicaViewRepo.findOneByOrFail({ idventa })
    }

    findById(idventa: number): Promise<FacturaElectronica>{
        return this.facturaElectronicaRepo.findOneByOrFail({ idventa });
    }

}
