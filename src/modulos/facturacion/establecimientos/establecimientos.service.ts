import { Establecimiento } from '@database/entity/facturacion/establecimiento.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EstablecimientosService {

    constructor(
        @InjectRepository(Establecimiento)
        private establecimientosRepo: Repository<Establecimiento>
    ){}

    public async findById(id: number): Promise<Establecimiento>{
        return this.establecimientosRepo.findOneBy({ id });
    }

}
