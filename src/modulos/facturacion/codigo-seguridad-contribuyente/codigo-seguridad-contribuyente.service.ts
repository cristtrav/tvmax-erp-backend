import { CodigoSeguridadContribuyente } from '@database/entity/facturacion/codigo-seguridad-contribuyente.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CodigoSeguridadContribuyenteService {

    constructor(
        @InjectRepository(CodigoSeguridadContribuyente)
        private cscRepo: Repository<CodigoSeguridadContribuyente>
    ){}

    async findActivo(): Promise<CodigoSeguridadContribuyente>{
        return this.cscRepo.findOneByOrFail({activo: true});
    }

}
