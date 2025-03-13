import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { Talonario } from '@database/entity/facturacion/talonario.entity';
import { Usuario } from '@database/entity/usuario.entity';
import { Venta } from '@database/entity/venta.entity';
import { EventoAuditoriaUtil } from '@globalutil/evento-auditoria-util';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UtilVentaService } from './util-venta.service';
import { Cuota } from '@database/entity/cuota.entity';
import { FacturaElectronicaUtilsService } from '@modulos/sifen/sifen-utils/services/dte/factura-electronica-utils.service';
import { SifenApiUtilService } from '@modulos/sifen/sifen-utils/services/sifen/sifen-api-util.service';
import { SifenUtilService } from '@modulos/sifen/sifen-utils/services/sifen/sifen-util.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CrearVentaService {

    constructor(
        @InjectRepository(Talonario)
        private talonarioRepo: Repository<Talonario>,
        @InjectRepository(Cuota)
        private cuotaRepo: Repository<Cuota>,
        private datasource: DataSource,
        private facturaElectronicaUtilSrv: FacturaElectronicaUtilsService,
        private sifenApiUtilSrv: SifenApiUtilService,
        private sifenUtilsSrv: SifenUtilService,
        private utilVentaSrv: UtilVentaService
    ){}

    async create(venta: Venta, detalles: DetalleVenta[], idusuario: number): Promise<number> {
        
        const talonario = await this.talonarioRepo.findOneOrFail({ where: { id: venta.idtalonario }, relations: { timbrado: true }});
        const oldTalonario = { ...talonario };

        if(talonario.timbrado.electronico){
            venta.nroFactura = Number(talonario.ultimoNroUsado ?? '0');
            do venta.nroFactura = venta.nroFactura + 1;
            while(await this.utilVentaSrv.facturaYaRegistrada(talonario.id, venta.nroFactura));
        }else if (await this.utilVentaSrv.facturaYaRegistrada(venta.idtalonario, venta.nroFactura))
            throw new HttpException({
            message: `El número de factura «${venta.nroFactura}» ya está registrado.`
        }, HttpStatus.BAD_REQUEST);

        venta.idusuarioRegistroFactura = idusuario;

        //Validar DV del RUC y corregir de ser necesario
        await this.utilVentaSrv.validarDvRuc(venta.idcliente);

        let idventa: number = -1;
        await this.datasource.transaction(async manager => {
            idventa = (await manager.save(venta)).id;
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaVenta(idusuario, 'R', null, venta));

            const cobro = await this.utilVentaSrv.crearCobro(venta, idusuario);
            await manager.save(cobro);
            await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCobro(3, 'R', null, cobro));

            talonario.ultimoNroUsado = venta.nroFactura;
            await manager.save(talonario);
            await manager.save(Talonario.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldTalonario, talonario));

            for (let detalle of detalles) {
                detalle.venta = venta;
                await manager.save(detalle);
                await manager.save(EventoAuditoriaUtil.getEventoAuditoriaDetalleVenta(idusuario, 'R', null, detalle));
                if (!venta.anulado && !venta.eliminado && detalle.idcuota) {
                    const cuota = await this.cuotaRepo.findOneByOrFail({ id: detalle.idcuota });
                    const oldCuota = { ...cuota };
                    cuota.pagado = true;
                    await manager.save(cuota);
                    await manager.save(EventoAuditoriaUtil.getEventoAuditoriaCuota(3, 'M', oldCuota, cuota));

                    if(cuota.codigoGrupo != null) await this.utilVentaSrv.actualizarCuotaGrupo(
                        cuota.codigoGrupo,
                        cuota.idsuscripcion,
                        cuota.idservicio, manager
                    );
                }
            }
            
            if(talonario.timbrado.electronico){
                let facturaElectronica = await this.facturaElectronicaUtilSrv.generarDTE(venta, detalles);
                await manager.save(DTE.getEventoAuditoria(idusuario, 'R', null, facturaElectronica));
                facturaElectronica = await manager.save(facturaElectronica);
                venta.iddte = facturaElectronica.id;
                await manager.save(venta);
                if(
                    !this.sifenUtilsSrv.isDisabled() &&
                    this.sifenUtilsSrv.getModo() == 'sync'
                ) await this.sifenApiUtilSrv.enviar(facturaElectronica, manager);   
            }
        });
        return idventa
    }

}
