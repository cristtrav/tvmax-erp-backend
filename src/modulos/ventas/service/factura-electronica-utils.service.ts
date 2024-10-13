import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { Venta } from '@database/entity/venta.entity';
import { HttpException, HttpStatus, Injectable, StreamableFile } from '@nestjs/common';
import xmlgen from 'facturacionelectronicapy-xmlgen';
import { DEParamsInterface } from '../model/factura-electronica/interfaces/de-params.interface';
import { DEDataInterface } from '../model/factura-electronica/interfaces/de-data.interface';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { DEActividadEconomicaInterface } from '../model/factura-electronica/interfaces/de-actividad-economica.interface';
import { DEEstablecimientoInterface } from '../model/factura-electronica/interfaces/de-establecimiento.interface';
import { TimbradoView } from '@database/view/timbrado.view';
import { DEClienteInterface } from '../model/factura-electronica/interfaces/de-cliente.interface';
import { DEItemInterface } from '../model/factura-electronica/interfaces/de-item.interface';
import generateKUDE from 'facturacionelectronicapy-kude/dist/KUDEGen';
import qrgen from 'facturacionelectronicapy-qrgen';
import xmlsign from 'facturacionelectronicapy-xmlsign';
import { readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { existsSync, mkdirSync, rmdirSync } from 'node:fs';
import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CodigoSeguridadContribuyente } from '@database/entity/facturacion/codigo-seguridad-contribuyente.entity';
import { Repository } from 'typeorm';
import { ClienteView } from '@database/view/cliente.view';
import { Establecimiento } from '@database/entity/facturacion/establecimiento.entity';
import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';


@Injectable()
export class FacturaElectronicaUtilsService {

    constructor(
        @InjectRepository(DatoContribuyente)
        private datoContribuyenteRepo: Repository<DatoContribuyente>,
        @InjectRepository(ActividadEconomica)
        private actividadEconomicaRepo: Repository<ActividadEconomica>,
        @InjectRepository(TimbradoView)
        private timbradoViewRepo: Repository<TimbradoView>,
        @InjectRepository(Establecimiento)
        private establecimientoRepo: Repository<Establecimiento>,
        @InjectRepository(ClienteView)
        private clienteViewRepo: Repository<ClienteView>,
        @InjectRepository(CodigoSeguridadContribuyente)
        private cscRepo: Repository<CodigoSeguridadContribuyente>
    ) { }

    public async generarDE(venta: Venta, detalles: DetalleVenta[]): Promise<string> {
        const timbrado = await this.timbradoViewRepo.findOneByOrFail({id: venta.idtimbrado});
        return await xmlgen.generateXMLDE(
            await this.getParams(timbrado),
            await this.getData(venta, detalles, timbrado),
            { test: false, redondeoSedeco: false }
        );
    }

    private async getParams(timbrado: TimbradoView): Promise<DEParamsInterface> {
        return {
            version: 150,
            ruc: (await this.datoContribuyenteRepo.findOneBy({clave: DatoContribuyente.RUC}))?.valor ?? '',
            razonSocial: (await this.datoContribuyenteRepo.findOneBy({clave: DatoContribuyente.RAZON_SOCIAL}))?.valor ?? '',
            actividadesEconomicas: await this.getActividadesEconomicas(),
            timbradoNumero: `${timbrado.nrotimbrado}`.padStart(8, '0'),
            timbradoFecha: timbrado.fechainicio,
            tipoContribuyente: 1,
            tipoRegimen: 8,
            establecimientos: await this.getEstablecimientos(timbrado.codestablecimiento)
        }
    }

    private async getData(venta: Venta, detalles: DetalleVenta[], timbrado: TimbradoView): Promise<DEDataInterface> {
        return {
            tipoDocumento: 1,
            establecimiento: `${timbrado.codestablecimiento}`.padStart(3, '0'),
            punto: `${timbrado.codpuntoemision}`.padStart(3, '0'),
            numero: `${venta.nroFactura}`.padStart(7, '0'),
            codigoSeguridadAleatorio: this.generarCodigoSeguridadAleatorio(),
            fecha: this.formatDate(new Date()),
            tipoEmision: 1,
            tipoTransaccion: 2,
            tipoImpuesto: 1,
            moneda: 'PYG',
            cliente: await this.getCliente(venta.idcliente),
            factura: { presencia: 1 },
            condicion: {
                tipo: 1,
                entregas: [{
                    tipo: 1,
                    moneda: 'PYG',
                    monto: `${venta.total}`,
                    cambio: 0
                }]
            },
            items: this.getItems(detalles)
        }
    }

    private async getActividadesEconomicas(): Promise<DEActividadEconomicaInterface[]> {
        return (await this.actividadEconomicaRepo.find()).map(acti => {
            return {
                codigo: `${acti.id}`,
                descripcion: acti.descripcion
            }
        });
    }
    private async getEstablecimientos(codEstablecimiento: number): Promise<DEEstablecimientoInterface[]> {
        const establecimiento = await this.establecimientoRepo.findOneByOrFail({id: codEstablecimiento});
        if (!establecimiento) return [];
        return [{
            codigo: `${establecimiento.id}`.padStart(3, '0'),
            denominacion: establecimiento.denominacion,
            direccion: establecimiento.direccion,
            departamento: establecimiento.codDepartamento,
            departamentoDescripcion: establecimiento.departamento,
            distrito: establecimiento.codDistrito,
            distritoDescripcion: establecimiento.distrito,
            ciudad: establecimiento.codCiudad,
            ciudadDescripcion: establecimiento.ciudad,
            numeroCasa: `${establecimiento.nroCasa}`,
            email: establecimiento.email,
            telefono: establecimiento.telefono
        }];
    }

    private async getCliente(idcliente: number): Promise<DEClienteInterface>{
        const cliente = await this.clienteViewRepo.findOneByOrFail({id: idcliente});
        const deCliente: DEClienteInterface = {
            contribuyente: cliente.dvruc != null,
            codigo: `${cliente.id}`,
            razonSocial: cliente.razonsocial,
            tipoOperacion: 2,
            tipoContribuyente: 1,
            pais: "PRY",
            paisDescripcion: "Paraguay",
            documentoTipo: 1,
            documentoNumero: cliente.ci
        }
        if(cliente.dvruc) deCliente.ruc = `${cliente.ci}-${cliente.dvruc}`;
        if(cliente.telefono1) deCliente.celular = cliente.telefono1;
        if(cliente.email) deCliente.email = cliente.email;
        return deCliente;
    }

    private getItems(detalles: DetalleVenta[]): DEItemInterface[]{
        const items: DEItemInterface[] = [];
        for(let detalle of detalles){
            items.push({
                codigo: `${detalle.id}`,
                descripcion: detalle.descripcion,
                unidadMedida: 77,
                cantidad: detalle.cantidad,
                precioUnitario: detalle.monto,
                pais: "PRY",
                paisDescripcion: "Paraguay",
                ivaTipo: 1,
                ivaBase: 100,
                iva: <0 | 5 | 10> detalle.porcentajeIva
            });
        }
        return items;
    }

    private formatDate(date: Date): string{
        const anio = date.getFullYear().toString();
        const mes = (date.getMonth() + 1).toString().padStart(2, '0');
        const dia = date.getDate().toString().padStart(2, '0');
        const hora = date.getHours().toString().padStart(2, '0');
        const minutos = date.getMinutes().toString().padStart(2, '0');
        const segundos = date.getSeconds().toString().padStart(2, '0');
        return `${anio}-${mes}-${dia}T${hora}:${minutos}:${segundos}`;
    }

    private generarCodigoSeguridadAleatorio(): string {
        const min = 1;
        const max = 999999999
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return `${Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)}`.padStart(9, '0');
    }

    public async generarDEFirmado(xml: string): Promise<string>{
        if(!process.env.SIFEN_CERT_FOLDER || process.env.SIFEN_CERT_FILENAME){
            console.log('SIFEN_CERT_FOLDER y/o SIFEN_CERT_FILENAME indefinidos en variables de entorno');
            return null;
        }
        const certFilePath = `${process.env.SIFEN_CERT_FOLDER}/${process.env.SIFEN_CERT_FILENAME}`;
        const certPassword = process.env.SIFEN_CERT_PASSWORD ?? '';
        try{
            return await xmlsign.signXML(xml, certFilePath, certPassword, true);
        }catch(e){
            console.error("Error al firmar digitalmente la factura:");
            console.error(e);
            return null;
        }
    }
      
    public async generateKude(factElectronica: FacturaElectronica): Promise<StreamableFile>{
        const timestamp = `${new Date().getTime()}`;
        if(!existsSync('tmp')) mkdirSync('tmp');
        if(!existsSync(`tmp/${timestamp}`)) mkdirSync(`tmp/${timestamp}`);
        
        const xmlWitQR = await this.generarDEConQR(factElectronica.documentoElectronico);
        
        const javaPath = process.env.JAVA_PATH ?? '/usr/bin/java';
        const filename = `${timestamp}.xml`;
        const dteFilePath = `tmp/${filename}`;
        const kudePath = `${process.cwd()}/tmp/${timestamp}/`;
        const jasperPath = process.env.KUDE_JASPER_PATH ?? `node_modules/facturacionelectronicapy-kude/dist/DE/`;
        const urlLogo = `${process.cwd()}/src/assets/img/logo-tvmax.png`;

        //Escribir XML a archivo temporal (La libreria lee el archivo del disco)
        await writeFile(dteFilePath, xmlWitQR ?? factElectronica.documentoElectronico);
        //Generar KUDE en PDF (La libreria genera en un archivo PDF en disco)
        await generateKUDE.generateKUDE(
            javaPath,
            dteFilePath,
            jasperPath,
            kudePath,
            `{LOGO_URL: '${urlLogo}', ambiente: '${xmlWitQR ? '1' : '0'}'}`
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

        return new StreamableFile(kudePdfFile);
    }

    private async generarDEConQR(signedXml: string): Promise<string>{
        try{
            const csc = await this.cscRepo.findOneByOrFail({activo: true});
            return await qrgen.generateQR(signedXml, `${csc.id}`, `${csc.codigoSeguridad}`, "prod");
        }catch(e){
            console.error("Error al generar y agregar QR a la factura electrónica");
            console.error(e);
            return null;
        }
        
    }
      
}