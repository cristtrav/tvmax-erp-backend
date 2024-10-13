import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DatoContribuyenteService {

    constructor(
        @InjectRepository(DatoContribuyente)
        private datoContribuyenteRep: Repository<DatoContribuyente>
    ){}

    public async findDato(clave: string): Promise<string>{
        return (await this.datoContribuyenteRep.findOneBy({ clave }))?.valor ?? '';
    }

}
