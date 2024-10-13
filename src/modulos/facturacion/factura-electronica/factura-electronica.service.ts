import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FacturaElectronicaService {

    constructor(
        @InjectRepository(FacturaElectronica)
        private facturaElectronicaRepo: Repository<FacturaElectronica>
    ){}

    findById(idventa: number){
        return this.facturaElectronicaRepo.findOneByOrFail({ idventa });
    }

}
