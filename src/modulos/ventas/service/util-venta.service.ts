import { Cliente } from '@database/entity/cliente.entity';
import { Cobro } from '@database/entity/cobro.entity';
import { CuotaGrupo } from '@database/entity/cuota-grupo.entity';
import { Cuota } from '@database/entity/cuota.entity';
import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { Usuario } from '@database/entity/usuario.entity';
import { Venta } from '@database/entity/venta.entity';
import { DigitoVerificadorRucService } from '@globalutil/services/digito-verificador-ruc.service';
import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class UtilVentaService {

    constructor(
        private dvRucSrv: DigitoVerificadorRucService,
        private datasource: DataSource
    ){}

    async actualizarCuotaGrupo(codigo: string, idsuscripcion: number, idservicio: number, manager: EntityManager){
        const nroCuotasGrupoPendientes = await manager.getRepository(Cuota)
        .countBy({
            codigoGrupo: codigo,
            idservicio,
            idsuscripcion,
            eliminado: false,
            pagado: false
        });
        if(nroCuotasGrupoPendientes > 0) return;

        const cuotaGrupo = await manager.getRepository(CuotaGrupo)
            .findOneByOrFail({
                codigo,
                idservicio,
                idsuscripcion
            });
        const oldCuotaGrupo = { ...cuotaGrupo };
        cuotaGrupo.activo = false;
        await manager.save(cuotaGrupo);
        await manager.save(CuotaGrupo.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldCuotaGrupo, cuotaGrupo));
    }

    async validarDvRuc(idcliente: number){
        const cli = await this.datasource.getRepository(Cliente).findOneByOrFail({ id: idcliente });
        if(cli.dvRuc == null) return;
        const dvGenerado = this.dvRucSrv.generar(cli.ci);
        if(dvGenerado != cli.dvRuc) await this.datasource.transaction(async mngr => {
            const oldCli = { ...cli };
            cli.dvRuc = dvGenerado;
            await mngr.save(cli);
            await mngr.save(Cliente.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldCli, cli));
        });
    }

    //Comprueba si la cuota fue pagada en otra transaccion
    async pagoCuotaExists(idcuota: number, idventaIgnorar: number): Promise<boolean> {
        const detalleQuery = this.datasource.getRepository(DetalleVenta).createQueryBuilder('detalle')
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

    async facturaYaRegistrada(idtalonario: number, nroFactura: number): Promise<boolean>{
        return (
            await this.datasource.getRepository(Venta).findOneBy({
            nroFactura,
            idtalonario,
            eliminado: false
            })
        ) != null
    }

    async crearCobro(venta: Venta, idusuario: number): Promise<Cobro> {
        const cobro = new Cobro();
        cobro.cobradoPor = idusuario;
        cobro.fecha = venta.fechaFactura;
        cobro.idventa = venta.id;
        cobro.comisionPara = (await this.datasource.getRepository(Cliente).findOneByOrFail({ id: venta.idcliente })).idcobrador;
        return cobro;
    }

}
