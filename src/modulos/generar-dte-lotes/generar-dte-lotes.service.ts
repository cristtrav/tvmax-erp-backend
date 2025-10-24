import { Injectable } from '@nestjs/common';
import { ParametrosGeneracionDTO } from './parametros-generacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { VentaView } from '@database/view/venta.view';
import { In, Repository } from 'typeorm';
import { Venta } from '@database/entity/venta.entity';
import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { FacturaElectronicaUtilsService } from '@modulos/sifen/sifen-utils/services/dte/factura-electronica-utils.service';

@Injectable()
export class GenerarDteLotesService {

    constructor(
        @InjectRepository(VentaView)
        private ventaViewRepo: Repository<VentaView>,
        @InjectRepository(Venta)
        private ventaRepo: Repository<Venta>,
        @InjectRepository(DTE)
        private dteRepo: Repository<DTE>,
        private facturaElectronicaUtilsSrv: FacturaElectronicaUtilsService
    ){}

    async generarDte(parametros: ParametrosGeneracionDTO): Promise<number>{
        const { desde, hasta, pagado, anulado, idestadodte } = parametros;
        let ventasViewQuery = await this.ventaViewRepo.createQueryBuilder('venta')
        .where(`venta.eliminado = FALSE`)
       
        if(desde != null) 
            ventasViewQuery = ventasViewQuery.andWhere(`venta.fechafactura >= :desde`, { desde })
        if(hasta != null)
            ventasViewQuery = ventasViewQuery.andWhere(`venta.fechafactura <= :hasta`, { hasta })
        if(pagado != null)
            ventasViewQuery = ventasViewQuery.andWhere(`venta.pagado = :pagado`, { pagado })
        if(anulado != null)
            ventasViewQuery = ventasViewQuery.andWhere(`venta.anulado = :anulado`, { anulado })
        if(idestadodte != null)
            ventasViewQuery = ventasViewQuery.andWhere(`venta.idestadodte = :idestadodte`, { idestadodte })

        const ventasView = await ventasViewQuery.getMany();
        const ventas = await this.ventaRepo.createQueryBuilder('venta')
        .where('venta.id IN (:...ids)', { ids: ventasView.map(vw => vw.id)})
        .leftJoinAndSelect('venta.detalles', 'detalle', 'detalle.eliminado = FALSE')
        .getMany();
        for(let v of ventas){
            const regenDte = await this.facturaElectronicaUtilsSrv.regenerarDTE(v, v.detalles)
            await this.dteRepo.save(regenDte);
        }
        return ventas.length;
    }
}
