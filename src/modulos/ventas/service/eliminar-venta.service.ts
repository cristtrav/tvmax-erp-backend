import { Cuota } from '@database/entity/cuota.entity';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { Venta } from '@database/entity/venta.entity';
import { VentaView } from '@database/view/venta.view';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { SifenApiUtilService } from '@modulos/sifen/sifen-utils/services/sifen/sifen-api-util.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UtilVentaService } from './util-venta.service';

@Injectable()
export class EliminarVentaService {

    constructor(
        @InjectRepository(Venta)
        private ventaRepo: Repository<Venta>,
        @InjectRepository(Cuota)
        private cuotaRepo: Repository<Cuota>,
        @InjectRepository(DTE)
        private facturaElectronicaRepo: Repository<DTE>,
        private datasource: DataSource,
        private utilVentaSrv: UtilVentaService
    ){}

    async delete(id: number, idusuario: number) {
        const venta = await this.ventaRepo.findOneOrFail({ where: { id }, relations: { detalles: true } })
        const oldVenta = { ...venta };
        venta.eliminado = true;

        const factElectronica = await this.facturaElectronicaRepo.findOneBy({ id: venta.iddte });
        if(factElectronica &&
            (factElectronica.idestadoDocumentoSifen != EstadoDocumentoSifen.RECHAZADO &&
             factElectronica.idestadoDocumentoSifen != EstadoDocumentoSifen.NO_ENVIADO)
        ) throw new HttpException({
            message: 'No se puede eliminar: Factura electrónica enviada a tributación'
        }, HttpStatus.BAD_REQUEST);

        await this.datasource.transaction(async manager => {
            await manager.save(venta);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaVenta(idusuario, 'E', oldVenta, venta));
            for (let detalle of venta.detalles.filter(deta => deta.idcuota != null)) {
                const cuota = await this.cuotaRepo.findOneByOrFail({ id: detalle.idcuota });
                const oldCuota = { ...cuota }
                cuota.pagado = await this.utilVentaSrv.pagoCuotaExists(detalle.idcuota, id);
                if (cuota.pagado != oldCuota.pagado) {
                    await manager.save(cuota);
                    await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCuota(3, 'M', oldCuota, cuota))
                };
            }
        });
    }

}
