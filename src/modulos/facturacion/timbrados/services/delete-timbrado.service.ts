import { Talonario } from '@database/entity/facturacion/talonario.entity';
import { Timbrado } from '@database/entity/facturacion/timbrado.entity';
import { Usuario } from '@database/entity/usuario.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class DeleteTimbradoService {

    constructor(
        @InjectRepository(Timbrado)
        private timbradoRepo: Repository<Timbrado>,
        private datasource: DataSource
    ){}

    async delete(nroTimbrado: number, idusuario: number){
        const timbrado = await this.timbradoRepo.findOneOrFail({ where: { nroTimbrado }, relations: { talonarios: true } });
        const oldTimbrado = { ...timbrado };

        timbrado.eliminado = true;
        
        await this.datasource.transaction(async manager => {
            await manager.save(timbrado);
            await manager.save(Timbrado.getEventoAuditoria(idusuario, 'E', oldTimbrado, timbrado));
            for(let talon of timbrado.talonarios){
                const oldTalon = { ...talon };
                talon.eliminado = true;
                await manager.save(talon);
                await manager.save(Talonario.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'E', oldTalon, talon));
            }
        })
    }

}
