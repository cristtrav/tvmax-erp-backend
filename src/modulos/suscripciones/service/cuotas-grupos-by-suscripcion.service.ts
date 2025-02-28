import { CuotaGrupo } from '@database/entity/cuota-grupo.entity';
import { CuotaGrupoView } from '@database/view/cuota-grupo.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CuotasGruposBySuscripcionService {

    constructor(
        @InjectRepository(CuotaGrupoView)
        private cuotaGrupoViewRepo: Repository<CuotaGrupoView>
    ){}

    async findBySuscripcion(idsuscripcion: number): Promise<CuotaGrupoView[]>{
        const alias = 'grupo';
        return await this.cuotaGrupoViewRepo.createQueryBuilder('grupo')
        .where(`${alias}.idsuscripcion = :idsuscripcion`, {idsuscripcion})
        .orderBy(`${alias}.codigo`, 'DESC')
        .getMany();
    }

}
