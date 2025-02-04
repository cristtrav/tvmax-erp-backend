import { DTE } from '@database/entity/facturacion/dte.entity';
import { Venta } from '@database/entity/venta.entity';
import { DteView } from '@database/view/facturacion/dte.view';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FacturaElectronicaService {

    constructor(
        @InjectRepository(Venta)
        private ventaRepo: Repository<Venta>,
        @InjectRepository(DTE)
        private dteRepo: Repository<DTE>,
        @InjectRepository(DteView)
        private dteViewRepo: Repository<DteView>
    ){}

    async findDetailsById(idventa: number): Promise<DteView>{
        const venta = await this.ventaRepo.findOneByOrFail({ id: idventa });
        if(venta.iddte == null) throw new HttpException({
            message: 'La venta no tiene una factura electrónica asociada'
        }, HttpStatus.NOT_FOUND);
        return this.dteViewRepo.findOneByOrFail({ id: venta.iddte });
    }

    findById(id: number): Promise<DTE>{
        return this.dteRepo.findOneByOrFail({ id });
    }

}
