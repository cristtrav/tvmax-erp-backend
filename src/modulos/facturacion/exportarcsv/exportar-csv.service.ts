import { VentaTributacionExpView } from '@database/view/venta-tributacion-exp.view';
import { HttpException, HttpStatus, Injectable, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { QueriesInterface } from './interfaces/queries.interface';
import * as AdmZip from 'adm-zip';

@Injectable()
export class ExportarCsvService {

    readonly MAX_PER_FILE: number = 5000;

    constructor(
        @InjectRepository(VentaTributacionExpView)
        private ventaViewRepo: Repository<VentaTributacionExpView>
    ){}

    private getSelectQuery(queries: QueriesInterface): SelectQueryBuilder<VentaTributacionExpView>{
        const alias = 'venta';
        const { mes, anio, parte } = queries;
        let selectQuery =
            this.ventaViewRepo.createQueryBuilder(alias)
            .where(`date_part('YEAR', ${alias}.fecha::date) = :anio`, { anio });
        if(mes != null) selectQuery = selectQuery.andWhere(`date_part('MONTH', ${alias}.fecha::date) = :mes`, { mes });
        if(parte != null){
            selectQuery = selectQuery.skip((parte - 1) * this.MAX_PER_FILE);
            selectQuery = selectQuery.take(this.MAX_PER_FILE);
        }
        return selectQuery;
    }

    async countFiles(queries: QueriesInterface): Promise<number>{
        delete queries.parte;
        const registersCount = await this.getSelectQuery(queries).getCount();
        if(registersCount == 0) return 0;
        return Math.ceil(registersCount/this.MAX_PER_FILE);
    }

    async generateFile(queries: QueriesInterface): Promise<StreamableFile>{
        if(queries.parte == null) throw new HttpException({
            message: `No se especificó el nro de archivo`
        }, HttpStatus.BAD_REQUEST);

        let zip = new AdmZip();
        const csvFileName =
            queries.mes != null ?
            this.getMonthFileName(queries.parte, queries.mes, queries.anio) :
            this.getYearFileName(queries.parte, queries.anio);
        zip.addFile(csvFileName, Buffer.from(
            this.generateCsv(await this.getSelectQuery(queries).getMany()),'utf-8')
        );
        return new StreamableFile(zip.toBuffer());
    }
    
    private generateCsv(ventas: VentaTributacionExpView[]): string{
        let csvText: string = '';

        csvText = ventas
            .map(v => Object.values(v).join(';'))
            .reduce((csvText, current) => `${csvText}\n${current}`);

        return csvText;
    }

    private getMonthFileName(fileNumber: number, mes: number, anio: number, extension: 'zip' | 'csv' = 'csv'): string {
        const fileNumberFilled = `${fileNumber}`.padStart(4, '0');
        const mesFilled = `${mes}`.padStart(2, '0');
        return `80029009_REG_${mesFilled}${anio}_V${fileNumberFilled}.${extension}`;
    }

    private getYearFileName(fileNumber: number, anio: number, extension: 'zip' | 'csv' = 'csv'): string {
        const fileNumberFilled = `${fileNumber}`.padStart(4, '0');
        return `80029009_REG_${anio}_V${fileNumberFilled}.${extension}`;
    }

}
