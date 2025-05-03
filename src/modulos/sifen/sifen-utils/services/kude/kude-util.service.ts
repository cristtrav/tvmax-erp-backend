import { DTE } from '@database/entity/facturacion/dte.entity';
import { SifenUtilService } from '@modulos/sifen/sifen-utils/services/sifen/sifen-util.service';
import { HttpException, HttpStatus, Injectable, StreamableFile } from '@nestjs/common';
import { existsSync, mkdirSync, rmdirSync } from 'fs';
import { writeFile, readdir, readFile, unlink} from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
const { exec } = require("child_process");

@Injectable()
export class KudeUtilService {

    constructor(
        private sifenUtilsSrv: SifenUtilService
    ){}

    public async generateKude(factElectronica: DTE, conDuplicado: boolean = false, direccionCliente?: string): Promise<StreamableFile>{
        const timestamp = `${new Date().getTime()}`;
        if(!existsSync('tmp')) mkdirSync('tmp');
        if(!existsSync(`tmp/${timestamp}`)) mkdirSync(`tmp/${timestamp}`);
        
        //const xmlWitQR = await this.generarDEConQR(factElectronica.documentoElectronico);
        let ambienteSifen = '-1';
        if(this.sifenUtilsSrv.isDisabled()) ambienteSifen = '0';
        else if(this.sifenUtilsSrv.getAmbiente() == 'test') ambienteSifen = '1';

        const filename = `${timestamp}.xml`;
        const dteFilePath = `${process.cwd()}/tmp/${filename}`;
        const kudePath = `${process.cwd()}/tmp/${timestamp}/`;
        const jasperPath = `${process.cwd()}/src/assets/facturacion-electronica/jasper/`;
        const urlLogo = `${process.cwd()}/src/assets/facturacion-electronica/img/logo-tvmax.png`;

        //Escribir XML a archivo temporal (La libreria lee el archivo del disco)
        await writeFile(dteFilePath, factElectronica.xml);

        //Generar KUDE en PDF (La libreria genera en un archivo PDF en disco)
        await this.generate(
            dteFilePath,
            jasperPath,
            kudePath,
            `{LOGO_URL: '${urlLogo}', ambiente: '${ambienteSifen}', DIRECCION_CLIENTE: '${direccionCliente}'}`
        );

        //Leer archivo PDF para retornar al cliente con GET
        const filesKudeArr = await readdir(kudePath);
        if(filesKudeArr.length == 0) throw new HttpException({
            message: "Error al generar KUDE de Factura: No se encontro el archivo PDF"
        }, HttpStatus.INTERNAL_SERVER_ERROR)
        const kudePdfFile = await readFile(`${kudePath}/${filesKudeArr[0]}`);

        //Eliminar archivos temporales
        await unlink(dteFilePath);
        await unlink(`${kudePath}/${filesKudeArr[0]}`);
        rmdirSync(kudePath);

        if(conDuplicado){
            const mergedPdf = await PDFDocument.create();

            const pdfA = await PDFDocument.load(kudePdfFile);
            const pdfB = await PDFDocument.load(kudePdfFile);

            const copiedPagesA = await mergedPdf.copyPages(pdfA, pdfA.getPageIndices());
            copiedPagesA.forEach((page) => mergedPdf.addPage(page));

            const copiedPagesB = await mergedPdf.copyPages(pdfB, pdfB.getPageIndices());
            copiedPagesB.forEach((page) => mergedPdf.addPage(page));

            const mergedPdfFile = await mergedPdf.save();
            return new StreamableFile(mergedPdfFile);
        }else{
            return new StreamableFile(kudePdfFile);
        }
    }

    private async generate(
        xml: string, //XML Content or XML Path
        srcJasper: string, //Path de los archivos .jasper
        destFolder: string, //Path destino del Archivo PDF
        jsonParam?: any //Parámetros a enviar al reporte en formato JSON
    ): Promise<string>{
        return new Promise((resolve, reject) => {
            const kudejasperBin = `${process.cwd()}/src/assets/facturacion-electronica/kudejasper/bin/kudejasper.sh`

            if (xml.includes(" ")) reject(
                new Error("El parámetro 'xml' no debe contener espacios")
            );
            if (srcJasper.includes(" ")) reject(
                new Error("El parámetro 'srcJasper' no debe contener espacios")
            );
            if (destFolder.includes(" ")) reject(
                new Error("El parámetro 'destFolder' no debe contener espacios")
            );
            
            const fullCommand = `${kudejasperBin} ${xml} ${srcJasper} ${destFolder} "${jsonParam}"`;
            console.log("fullCommand", fullCommand);
            exec(
              fullCommand,
              { encoding: "UTF-8", maxBuffer: 1024 * 1024 },
              (error: any, stdout: any, stderr: any) => {
                if (error) reject(error);
                if (stderr) reject(stderr);
                resolve(`${stdout}`);
              }
            );
        });
    }

}
