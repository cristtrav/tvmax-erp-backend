import { Timbrado } from '@database/entity/facturacion/timbrado.entity';
import { TimbradoDTO } from '@dto/facturacion/timbrado.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class EditTimbradoService {

    constructor(
        @InjectRepository(Timbrado)
        private timbradoRepo: Repository<Timbrado>,
        private datasource: DataSource
    ){}

    async edit(nrotimbrado: number, timbrado: Timbrado, idusuario: number){
        const oldTimbrado = await this.timbradoRepo.findOneByOrFail({nroTimbrado: nrotimbrado});
        
        await this.datasource.transaction(async manager => {
            await manager.save(timbrado);
            await manager.save(Timbrado.getEventoAuditoria(idusuario, 'M', oldTimbrado, timbrado));

            if(nrotimbrado != timbrado.nroTimbrado)
                await manager.remove(oldTimbrado);
        });
        
    }

}
