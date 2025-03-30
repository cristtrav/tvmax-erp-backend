import { AjusteExistencia } from '@database/entity/depositos/ajuste-existencia.entity';
import { AjusteMaterialIdentificable } from '@database/entity/depositos/ajuste-material-identificable.entity';
import { Existencia } from '@database/entity/depositos/existencia.entity';
import { MaterialIdentificable } from '@database/entity/depositos/material-identificable.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class EliminarAjustesService {

    constructor(
        @InjectRepository(AjusteExistencia)
        private ajustesExistenciasRepo: Repository<AjusteExistencia>,
        @InjectRepository(Existencia)
        private existenciasRepo: Repository<Existencia>,
        @InjectRepository(AjusteMaterialIdentificable)
        private ajusteMaterialIdentificableRepo: Repository<AjusteMaterialIdentificable>,
        private datasource: DataSource
    ){}

    async eliminar(id: number, idusuario: number){
        const ajuste = await this.ajustesExistenciasRepo.findOneByOrFail({ id });
        const oldAjuste = { ...ajuste };
        const existencia = await this.existenciasRepo.findOneByOrFail({
            iddeposito: 1,
            idmaterial: ajuste.idmaterial
        });
        const oldExistencia = { ...existencia };

        ajuste.eliminado = true;
        existencia.cantidad = ajuste.cantidadAnterior;

        await this.datasource.transaction(async manager => {
            await manager.save(ajuste);
            await manager.save(AjusteExistencia.getEventoAuditoria(idusuario, 'E', oldAjuste, ajuste));
            await manager.save(existencia)
            await manager.save(Existencia.getEventoAuditoria(idusuario, 'M', oldExistencia, existencia));

            const ajustesIdentificables = await this.ajusteMaterialIdentificableRepo.findBy({
                idajusteExistencia: ajuste.id,
            });
            
            for(let aji of ajustesIdentificables){
                const materialIdentificable = await this.datasource
                    .getRepository(MaterialIdentificable)
                    .findOneByOrFail({
                        idmaterial: aji.idmaterial,
                        serial: aji.serial
                    });
                materialIdentificable.disponible = aji.disponibilidadAnterior;
                materialIdentificable.eliminado = aji.bajaAnterior;
                await manager.save(materialIdentificable);
            }
        });
    }

}
