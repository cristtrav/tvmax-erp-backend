import { VentaView } from "@database/view/venta.view";
import { Injectable, StreamableFile } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository, SelectQueryBuilder } from "typeorm";
import * as Excel from 'exceljs';
import { Readable } from "stream";

const appendIdOnSort: string[] = [
    "fechafactura",
    "fechacobro",
    "ci",
    "cliente",
    "total"
]

@Injectable()
export class ExportarVentasService {

    constructor(
        @InjectRepository(VentaView)
        private ventaViewRepo: Repository<VentaView>
    ) { }

    private getSelectQuery(queries: { [name: string]: any }): SelectQueryBuilder<VentaView> {
        const {
            eliminado,
            search,
            fechainiciofactura,
            fechafinfactura,
            pagado,
            anulado,
            idcobradorcomision,
            idusuarioregistrocobro,
            fechainiciocobro,
            fechafincobro,
            sort,
            idtalonario,
            nrofactura,
            idestadodte
        } = queries;

        const alias: string = 'venta';
        let query: SelectQueryBuilder<VentaView> = this.ventaViewRepo.createQueryBuilder(alias);

        if (eliminado != null) query = query.andWhere(`${alias}.eliminado = :eliminado`, { eliminado });
        if (pagado != null) query = query.andWhere(`${alias}.pagado = :pagado`, { pagado });
        if (anulado != null) query = query.andWhere(`${alias}.anulado = :anulado`, { anulado });
        if (fechainiciofactura) query = query.andWhere(`${alias}.fechafactura >= :fechainiciofactura`, { fechainiciofactura });
        if (fechafinfactura) query = query.andWhere(`${alias}.fechafactura <= :fechafinfactura`, { fechafinfactura });
        if (fechainiciocobro) query = query.andWhere(`${alias}.fechacobro >= :fechainiciocobro`, { fechainiciocobro });
        if (fechafincobro) query = query.andWhere(`${alias}.fechacobro <= :fechafincobro`, { fechafincobro });
        if (nrofactura) query = query.andWhere(`${alias}.nrofactura = :nrofactura`, { nrofactura });
        if (idtalonario) query = query.andWhere(`${alias}.idtalonario = :idtalonario`, { idtalonario });
        if (idestadodte) query = query.andWhere(`${alias}.idestadodte = :idestadodte`, { idestadodte });
        if (idcobradorcomision)
            if (Array.isArray(idcobradorcomision)) query = query.andWhere(`${alias}.idcobradorcomision IN (:...idcobradorcomision)`, { idcobradorcomision });
            else query = query.andWhere(`${alias}.idcobradorcomision = :idcobradorcomision`, { idcobradorcomision });
        if (idusuarioregistrocobro)
            if (Array.isArray(idusuarioregistrocobro)) query = query.andWhere(`${alias}.idusuarioregistrocobro IN (:...idusuarioregistrocobro)`, { idusuarioregistrocobro });
            else query = query.andWhere(`${alias}.idusuarioregistrocobro = :idusuarioregistrocobro`, { idusuarioregistrocobro });
        if (search) {
            query = query.andWhere(new Brackets(qb => {
                qb = qb.orWhere(`LOWER(${alias}.cliente) LIKE :searchcli`, { searchcli: `%${search.toLowerCase()}%` });
                if (Number.isInteger(Number(search))) qb = qb.orWhere(`${alias}.nrofactura = :searchnrofact`, { searchnrofact: search });
            }));
        }

        if (sort) {
            const sortColumn = sort.substring(1);
            const sortOrder: 'ASC' | 'DESC' = sort.charAt(0) === '-' ? 'DESC' : 'ASC';
            if(sortColumn === 'nrofactura'){
                query = query.orderBy(`${alias}.prefijofactura`, sortOrder);
                query = query.addOrderBy(`${alias}.nrofactura`, sortOrder);
            }else query = query.orderBy(`${alias}.${sortColumn}`, sortOrder);
            if(appendIdOnSort.includes(sortColumn)) query = query.addOrderBy(`${alias}.id`, sortOrder);
        }
        return query;
    }


    async exportarXlsx(queries: {[name: string]: any}): Promise<StreamableFile>{
        const ventas = await this.getSelectQuery(queries).getMany();

        const workbook = new Excel.Workbook();
        workbook.creator = 'TVMax ERP';
        workbook.created = new Date();
        workbook.modified = new Date();

        const headerStyle: Partial<Excel.Style> = {
            font: { bold: true }
        }

        const sheet = workbook.addWorksheet('Ventas');
        sheet.columns = [
            { header: 'Código', key: 'id', width: 10 },
            { header: 'RUC', key: 'ruc', width: 15 },
            { header: 'Cliente', key: 'cliente', width: 50 },
            { header: 'Condición', key: 'condicion', width: 10 },
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Número', key: 'numero', width: 20 },
            { header: 'Monto', key: 'monto', width: 10 },
            { header: 'Anulado', key: 'anulado', width: 8 },
            { header: 'Pagado', key: 'pagado', width: 8 },
            { header: 'F. Elect.', key: 'electronico', width: 10}
        ]
        for(let venta of ventas){
            sheet.addRow({
                id: venta.id,
                ruc: `${venta.dvruc != null ? venta.ci + '-' + venta.dvruc : venta.ci }`,
                cliente: venta.cliente,
                condicion: venta.condicion == 'CON' ? 'Contado' : 'Crédito',
                fecha: venta.fechafactura,
                numero: `${venta.prefijofactura}-${venta.nrofactura.toString().padStart(7, '0')}`,
                monto: venta.total,
                anulado: venta.anulado ? 'Sí' : 'No',
                pagado: venta.pagado ? 'Sí' : 'No',
                electronico: venta.facturaelectronica ? 'Sí' : 'No'
            })
        }
        
        for(let i = 1; i<= 10; i++)
            sheet.getRow(1).getCell(i).style = headerStyle 

        const buffer = await workbook.xlsx.writeBuffer();
        const stream = Readable.from(buffer as any);
        return new StreamableFile(stream, {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            disposition: 'attachment; filename="ventas.xlsx"'
        })
    }

}