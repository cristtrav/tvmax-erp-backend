import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class ActividadEconomicaService {

    constructor(
        @InjectRepository(ActividadEconomica)
        private actividadEconomicaRepo: Repository<ActividadEconomica>
    ){}

    private getSelectQuery(params: {[name: string]: any}): SelectQueryBuilder<ActividadEconomica>{
        const alias = "actividad";
        let query = this.actividadEconomicaRepo.createQueryBuilder(alias);
        return query;
    }

    public findAll(params: {[name: string]: any}): Promise<ActividadEconomica[]>{
        return this.getSelectQuery(params).getMany();
    }

}
