import { Timbrado } from '@database/entity/facturacion/timbrado.entity';
import { TimbradoView } from '@database/view/facturacion/timbrado.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FindByNroTimbradoTimbradosService {

    constructor(
        @InjectRepository(TimbradoView)
        private timbradosRepo: Repository<TimbradoView>
    ){}

    public async findByNroTimbrado(nrotimbrado: number): Promise<TimbradoView>{
        return this.timbradosRepo.findOneByOrFail({ nrotimbrado });
    }

}
