import { NotaCreditoDetalle } from '@database/entity/facturacion/nota-credito-detalle.entity';
import { NotaCreditoDetalleView } from '@database/view/facturacion/nota-credito-detalle.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FindDetallesByNotaCreditoService {

    constructor(
        @InjectRepository(NotaCreditoDetalleView)
        private notaCreditoDetalleRepo: Repository<NotaCreditoDetalleView>
    ){}

    async findDetallesByNotaCredito(idnotacredito: number): Promise<NotaCreditoDetalleView[]>{
        const alias = 'detalle';
        return this.notaCreditoDetalleRepo.createQueryBuilder(alias)
            .where(`${alias}.eliminado = false`)
            .andWhere(`${alias}.idnotacredito = :idnotacredito`, { idnotacredito })
            .getMany();
    }
}
