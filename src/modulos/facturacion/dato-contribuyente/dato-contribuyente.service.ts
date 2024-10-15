import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { DatoContribuyenteDTO } from '@dto/facturacion/dato-contribuyente.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class DatoContribuyenteService {

    constructor(
        @InjectRepository(DatoContribuyente)
        private datoContribuyenteRep: Repository<DatoContribuyente>,
        private datasource: DataSource
    ){}

    private getQuery(): SelectQueryBuilder<DatoContribuyente>{
        const alias = 'dato';
        let query = this.datoContribuyenteRep.createQueryBuilder(alias);
        return query;
    }

    public async findDato(clave: string): Promise<string>{
        return (await this.datoContribuyenteRep.findOneBy({ clave }))?.valor ?? '';
    }

    public findAll(): Promise<DatoContribuyente[]>{
        return this.getQuery().getMany();
    }

    public async create(datos: DatoContribuyenteDTO[], idusuario: number){
        await this.datasource.transaction(async manager => {
            for(let dato of datos.map(dto => new DatoContribuyente().fromDTO(dto))) {
                const oldValue = await this.datoContribuyenteRep.findOneBy({clave: dato.clave});
                await manager.save(dato);
                await manager.save(DatoContribuyente.getEventoAuditoria(idusuario, 'R', oldValue, dato))
            }
        });
    }

}
