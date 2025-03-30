import { AjusteExistencia } from '@database/entity/depositos/ajuste-existencia.entity';
import { AjusteMaterialIdentificable } from '@database/entity/depositos/ajuste-material-identificable.entity';
import { Existencia } from '@database/entity/depositos/existencia.entity';
import { MaterialIdentificable } from '@database/entity/depositos/material-identificable.entity';
import { AjusteExistenciaDTO } from '@dto/depositos/ajuste-existencia.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class EditarAjustesService {

    constructor(
        @InjectRepository(AjusteExistencia)
        private ajusteExistenciaRepo: Repository<AjusteExistencia>,
        @InjectRepository(Existencia)
        private existenciasRepo: Repository<Existencia>,
        private datasource: DataSource
    ){}

    async editar(
        idajusteExistencia: number,
        ajusteExistencia: AjusteExistencia,
        idusuario: number,
        ajustesIdentificables?: AjusteMaterialIdentificable[]
    ){
        const ajuste = await this.ajusteExistenciaRepo.findOneByOrFail({id: idajusteExistencia});
        const oldAjuste = { ...ajuste };
        const existencia = await this.existenciasRepo.findOneByOrFail({
            iddeposito: 1,
            idmaterial: ajuste.idmaterial
        });
        const oldExistencia = { ...existencia };

        ajuste.fechaHora = new Date();
        ajuste.cantidadNueva = ajusteExistencia.cantidadNueva;
        ajuste.idusuario = idusuario;

        existencia.cantidad = ajusteExistencia.cantidadNueva;
        
        await this.datasource.transaction(async manager => {
            await manager.save(ajuste);
            await manager.save(AjusteExistencia.getEventoAuditoria(idusuario, 'M', oldAjuste, ajuste));
            await manager.save(existencia);
            await manager.save(Existencia.getEventoAuditoria(idusuario, 'M', oldExistencia, existencia));

            if(ajustesIdentificables){
                for(let aji of ajustesIdentificables){
                    let ajusteIdentificable = await manager
                        .getRepository(AjusteMaterialIdentificable)
                        .findOneByOrFail({
                            idajusteExistencia: aji.idajusteExistencia,
                            idmaterial: aji.idmaterial,
                            serial: aji.serial
                        });
                    ajusteIdentificable.bajaNueva = aji.bajaNueva;
                    ajusteIdentificable.disponibilidadNueva = aji.disponibilidadNueva;
                    await manager.save(ajusteIdentificable);

                    let materialIdentificable = await manager
                        .getRepository(MaterialIdentificable)
                        .findOneByOrFail({
                            idmaterial: aji.idmaterial,
                            serial: aji.serial
                        });
                    
                    materialIdentificable.eliminado = aji.bajaNueva;
                    materialIdentificable.disponible = aji.disponibilidadNueva;
                    await manager.save(materialIdentificable);
                }
            }
        });
    }

}
