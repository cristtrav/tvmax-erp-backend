import { DTE } from '@database/entity/facturacion/dte.entity';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { NotaCredito } from '@database/entity/facturacion/nota-credito.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class DeleteNotaCreditoService {

    constructor(
        @InjectRepository(NotaCredito)
        private notaCreditoRepo: Repository<NotaCredito>,
        @InjectRepository(DTE)
        private dteRepo: Repository<DTE>,
        private datasource: DataSource
    ){}

    async deleteNotaCredito(id: number, idusuario: number){
        const nota = await this.notaCreditoRepo.findOneByOrFail({ id });
        const oldNota = { ...nota };
        const dte = await this.dteRepo.findOneByOrFail({ id: nota.iddte });
        
        if(
            dte.idestadoDocumentoSifen == EstadoDocumentoSifen.APROBADO ||
            dte.idestadoDocumentoSifen == EstadoDocumentoSifen.APROBADO_CON_OBS
        ) throw new HttpException({
            message: 'La nota de crédito ya fué aprobada por SIFEN'
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            nota.eliminado = true;
            await manager.save(nota);
            await manager.save(NotaCredito.getEventoAuditoria(idusuario, 'E', oldNota, nota));
        });
    }

}
