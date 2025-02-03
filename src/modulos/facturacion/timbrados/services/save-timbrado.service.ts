import { Timbrado } from '@database/entity/facturacion/timbrado.entity';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SaveTimbradoService {

    constructor(
        private datasource: DataSource
    ){}

    async save(idusuario: number, timbrado: Timbrado){
        console.log('save timbrado')
        await this.datasource.transaction(async manager => {
            await manager.save(timbrado);
            await manager.save(Timbrado.getEventoAuditoria(idusuario, 'R', null, timbrado));
        })
    }

}
