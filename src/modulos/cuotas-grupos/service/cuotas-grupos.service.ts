import { CuotaGrupo } from '@database/entity/cuota-grupo.entity';
import { CuotaGrupoView } from '@database/view/cuota-grupo.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import * as uniqueSequence from 'unique-sequence'

@Injectable()
export class CuotasGruposService {

    constructor(
        @InjectRepository(CuotaGrupoView)
        private cuotaGrupoViewRepo: Repository<CuotaGrupoView>,
        @InjectRepository(CuotaGrupo)
        private cuotaGrupo: Repository<CuotaGrupo>,
        private datasource: DataSource
    ){}

    private getSelectQuery(queries: QueriesType): SelectQueryBuilder<CuotaGrupoView>{
        const { idsuscripcion, idservicio, activo } = queries;
        const alias = 'grupo';
        let query = this.cuotaGrupoViewRepo.createQueryBuilder(alias);
        if(idsuscripcion != null) query = query.andWhere(`${alias}.idsuscripcion = :idsuscripcion`, { idsuscripcion });
        if(idservicio != null) query = query.andWhere(`${alias}.idservicio = :idservicio`, { idservicio });
        if(activo != null ) query = query.andWhere(`${alias}.activo = :activo`, { activo });
        return query;
    }

    findAll(queries: QueriesType): Promise<CuotaGrupoView[]>{
        return this.getSelectQuery(queries).getMany();
    }

    async create(cuotaGrupo: CuotaGrupo, idusuario: number): Promise<CuotaGrupo> {
        const lastCuotaGrupo = await this.cuotaGrupo.createQueryBuilder('grupo')
            .where(`grupo.idsuscripcion = :idsuscripcion`, { idsuscripcion: cuotaGrupo.idsuscripcion })
            .andWhere(`grupo.idservicio = :idservicio`, { idservicio: cuotaGrupo.idservicio })
            .orderBy(`grupo.codigo`, `DESC`)
            .getOne();

        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.startTransaction();
        try{
            cuotaGrupo.codigo = this.generarSiguienteCadena(lastCuotaGrupo?.codigo);
            const savedGrupo = await queryRunner.manager.save(cuotaGrupo);
            await queryRunner.manager.save(CuotaGrupo.getEventoAuditoria(idusuario, 'R', null, cuotaGrupo));
            await queryRunner.commitTransaction();
            return savedGrupo;
        } catch(e) {
            console.error('Error al registrar grupo cuota', e);
            await queryRunner.rollbackTransaction();
            throw e;
        } finally {
            await queryRunner.release();
        }
    }

    private generarSiguienteCadena(cadenaActual: string | null | undefined): string {
        const gen = uniqueSequence.generatorAlphaUpper();
        if(cadenaActual == null) return gen.next().value;
        
        let letra = gen.next().value;
        let count = 0;
        while(letra != cadenaActual && count <= 5000){
            letra = gen.next().value;
            count ++;
        }
        return gen.next().value;
    }

}

type QueriesType = {[name:string]: any}