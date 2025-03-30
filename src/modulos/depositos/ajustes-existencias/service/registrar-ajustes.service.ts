import { AjusteExistencia } from '@database/entity/depositos/ajuste-existencia.entity';
import { AjusteMaterialIdentificable } from '@database/entity/depositos/ajuste-material-identificable.entity';
import { Existencia } from '@database/entity/depositos/existencia.entity';
import { MaterialIdentificable } from '@database/entity/depositos/material-identificable.entity';
import { Material } from '@database/entity/depositos/material.entity';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class RegistrarAjustesService {

    constructor(
        private datasource: DataSource
    ){}

    async create(
        ajuste: AjusteExistencia,
        idusuario: number,
        ajustesIdentificables?: AjusteMaterialIdentificable[]
    ): Promise<number>{
        let idajuste = -1;
        await this.datasource.transaction(async manager => {
            const material = await manager
                .getRepository(Material)
                .findOneByOrFail({id: ajuste.idmaterial});

            const existencia = await manager
                .getRepository(Existencia)
                .findOneByOrFail({idmaterial: ajuste.idmaterial, iddeposito: 1});
            const oldExistencia = { ...existencia };

            ajuste.idusuario = idusuario;
            ajuste.fechaHora = new Date();
            ajuste.cantidadAnterior = existencia.cantidad;
            existencia.cantidad = ajuste.cantidadNueva;

            const savedAjuste = await manager.save(ajuste);
            await manager.save(AjusteExistencia.getEventoAuditoria(idusuario, 'R', null, ajuste));
            await manager.save(existencia);
            await manager.save(Existencia.getEventoAuditoria(idusuario, 'M', oldExistencia, existencia));
            idajuste = savedAjuste.id;
            
            if(material.identificable && ajustesIdentificables){
                for(let aji of ajustesIdentificables){
                    let materialIdent = await this.datasource
                        .getRepository(MaterialIdentificable)
                        .findOneBy({idmaterial: ajuste.idmaterial, serial: aji.serial});
                    if(!materialIdent){
                        let newMaterialident = Object.assign(new MaterialIdentificable(), {
                            serial: aji.serial,
                            idmaterial: ajuste.idmaterial,
                            disponible: false,
                            eliminado: false
                        });
                        materialIdent = await manager.save(newMaterialident);
                    }
                    const oldMaterialIdent = { ... materialIdent };

                    aji.idajusteExistencia = idajuste;
                    aji.bajaAnterior = oldMaterialIdent.eliminado; //cambiar luego de actualizar la bd
                    aji.disponibilidadAnterior = oldMaterialIdent.disponible;
                    aji.idmaterial = aji.idmaterial;
                    await manager.save(aji);

                    materialIdent.disponible = aji.disponibilidadNueva;
                    materialIdent.eliminado = aji.bajaNueva;
                    await manager.save(materialIdent);
                }
            }
        });
        return idajuste;
    }

}
