import { Cuota } from '@database/entity/cuota.entity';
import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { Talonario } from '@database/entity/facturacion/talonario.entity';
import { Venta } from '@database/entity/venta.entity';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AnularVentaService {

    constructor(
        @InjectRepository(Venta)
        private ventaRepo: Repository<Venta>,
        @InjectRepository(Talonario)
        private talonarioRepo: Repository<Talonario>,
        @InjectRepository(Cuota)
        private cuotaRepo: Repository<Cuota>,
        @InjectRepository(DetalleVenta)
        private detalleVentaRepo: Repository<DetalleVenta>,
        private datasource: DataSource
    ){}

    async anular(idventa: number, anulado: boolean, idusuario: number) {
        const venta = await this.ventaRepo.findOneOrFail({ where: { id: idventa }, relations: { detalles: true } });
        const talonario = await this.talonarioRepo.findOneOrFail({ where: {id: venta.idtalonario}, relations: {timbrado: true} });
        const oldVenta = { ...venta };

        if(talonario.timbrado.electronico) throw new HttpException({
            message: `Para anular una Factura Electrónica debe usarse Cancelación o Nota de Crédito.`
        }, HttpStatus.BAD_REQUEST)

        await this.datasource.transaction(async manager => {
            
            venta.anulado = anulado;    
            await manager.save(venta);
            
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaVenta(idusuario, 'M', oldVenta, venta));

            for (let detalle of venta.detalles.filter(deta => deta.idcuota != null)) {
                const cuota = await this.cuotaRepo.findOneByOrFail({ id: detalle.idcuota });
                const oldCuota = { ...cuota }
                cuota.pagado = !venta.anulado && venta.pagado ? true : await this.pagoCuotaExists(detalle.idcuota, idventa);
                if (cuota.pagado != oldCuota.pagado) {
                    await manager.save(cuota);
                    await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCuota(3, 'M', oldCuota, cuota))
                };
            }
        });
    }

    //Comprueba si la cuota fue pagada en otra transaccion
    private async pagoCuotaExists(idcuota: number, idventaIgnorar: number): Promise<boolean> {
        const detalleQuery = this.detalleVentaRepo.createQueryBuilder('detalle')
            .innerJoin(`detalle.cuota`, 'cuota', 'detalle.eliminado = :dveliminado', { dveliminado: false })
            .innerJoin(
                `detalle.venta`,
                'venta',
                'venta.eliminado = :veliminada AND venta.anulado = :vanulada AND venta.pagado = :vpagado AND venta.id != :idventaIgnorar',
                { veliminada: false, vanulada: false, vpagado: true, idventaIgnorar }
            )
            .where('detalle.idcuota = :idcuota', { idcuota });
        return (await detalleQuery.getCount()) != 0;
    }
}
