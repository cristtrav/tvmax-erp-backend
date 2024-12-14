import { Injectable } from '@nestjs/common';
const { exec } = require("child_process");

@Injectable()
export class KudeUtilsService {

    async generate(
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
