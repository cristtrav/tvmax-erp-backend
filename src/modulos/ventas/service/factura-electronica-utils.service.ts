import { DetalleVenta } from '@database/entity/detalle-venta.entity';
import { Venta } from '@database/entity/venta.entity';
import { HttpException, HttpStatus, Injectable, StreamableFile } from '@nestjs/common';
import xmlgen from 'facturacionelectronicapy-xmlgen';
import { DEParamsInterface } from '../model/factura-electronica/interfaces/de-params.interface';
import { DEDataInterface } from '../model/factura-electronica/interfaces/de-data.interface';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { DEActividadEconomicaInterface } from '../model/factura-electronica/interfaces/de-actividad-economica.interface';
import { DEEstablecimientoInterface } from '../model/factura-electronica/interfaces/de-establecimiento.interface';
import { TalonarioView } from '@database/view/facturacion/talonario.view';
import { DEClienteInterface } from '../model/factura-electronica/interfaces/de-cliente.interface';
import { DEItemInterface } from '../model/factura-electronica/interfaces/de-item.interface';
import qrgen from 'facturacionelectronicapy-qrgen';
import xmlsign from 'facturacionelectronicapy-xmlsign';
import { copyFile, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { existsSync, mkdirSync, rmdirSync } from 'node:fs';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CodigoSeguridadContribuyente } from '@database/entity/facturacion/codigo-seguridad-contribuyente.entity';
import { Repository } from 'typeorm';
import { ClienteView } from '@database/view/cliente.view';
import { Establecimiento } from '@database/entity/facturacion/establecimiento.entity';
import { ActividadEconomica } from '@database/entity/facturacion/actividad-economica.entity';
import { SifenUtilService } from './sifen-util.service';
import { ConsultaRucService } from '@modulos/sifen/consulta-ruc/services/consulta-ruc.service';
import { ConsultaRucMessageService } from '@modulos/sifen/consulta-ruc/services/consulta-ruc-message.service';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { EstadoEnvioEmail } from '@database/entity/facturacion/estado-envio-email.entity.dto';
import { KudeUtilsService } from '@globalutil/kude-utils.service';
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class FacturaElectronicaUtilsService {

    constructor(
        private sifenUtilsSrv: SifenUtilService,
        @InjectRepository(DatoContribuyente)
        private datoContribuyenteRepo: Repository<DatoContribuyente>,
        @InjectRepository(ActividadEconomica)
        private actividadEconomicaRepo: Repository<ActividadEconomica>,
        @InjectRepository(TalonarioView)
        private talonarioViewRepo: Repository<TalonarioView>,
        @InjectRepository(Establecimiento)
        private establecimientoRepo: Repository<Establecimiento>,
        @InjectRepository(ClienteView)
        private clienteViewRepo: Repository<ClienteView>,
        @InjectRepository(CodigoSeguridadContribuyente)
        private cscRepo: Repository<CodigoSeguridadContribuyente>,
        private consultaRucSrv: ConsultaRucService,
        @InjectRepository(DTE)
        private facturaElectronicaRepo: Repository<DTE>,
        private kudeUtils: KudeUtilsService
    ) { }

    public async generarDE(venta: Venta, detalles: DetalleVenta[]): Promise<string> {
        const talonario = await this.talonarioViewRepo.findOneByOrFail({id: venta.idtalonario});
        return await xmlgen.generateXMLDE(
            await this.getParams(talonario),
            await this.getData(venta, detalles, talonario),
            { test: false, redondeoSedeco: false }
        );
    }

    public async getParams(talonario: TalonarioView): Promise<DEParamsInterface> {
        return {
            version: 150,
            ruc: (await this.datoContribuyenteRepo.findOneBy({clave: DatoContribuyente.RUC}))?.valor ?? '',
            razonSocial: (await this.datoContribuyenteRepo.findOneBy({clave: DatoContribuyente.RAZON_SOCIAL}))?.valor ?? '',
            actividadesEconomicas: await this.getActividadesEconomicas(),
            timbradoNumero: `${talonario.nrotimbrado}`.padStart(8, '0'),
            timbradoFecha: talonario.fechainicio,
            tipoContribuyente: 1,
            tipoRegimen: 8,
            establecimientos: await this.getEstablecimientos(talonario.codestablecimiento)
        }
    }

    private async getData(venta: Venta, detalles: DetalleVenta[], talonario: TalonarioView): Promise<DEDataInterface> {
        return {
            tipoDocumento: 1,
            establecimiento: `${talonario.codestablecimiento}`.padStart(3, '0'),
            punto: `${talonario.codpuntoemision}`.padStart(3, '0'),
            numero: `${venta.nroFactura}`.padStart(7, '0'),
            codigoSeguridadAleatorio: this.generarCodigoSeguridadAleatorio(),
            fecha: this.formatDate(venta.fechaHoraFactura ?? venta.fechaFactura ?? new Date()),
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

    private async consultarRazonSocialSifen(ci: string): Promise<string | null> {
        try{
            const response = await this.consultaRucSrv.consultar(ci);
            if(response.codigo == ConsultaRucMessageService.COD_ENCONTRADO)
                return response.detalleRuc.razonSocial;
            else return null;
        }catch(e){
            console.log('Error al consultar ruc', e);
        }
        return null;
    }

    private async getCliente(idcliente: number): Promise<DEClienteInterface>{
        const cliente = await this.clienteViewRepo.findOneByOrFail({id: idcliente});

        const deCliente: DEClienteInterface = {
            contribuyente: cliente.dvruc != null,
            codigo: `${cliente.id}`.padStart(3, '0'),
            razonSocial: await this.consultarRazonSocialSifen(cliente.ci) ?? cliente.razonsocial,
            tipoOperacion: 2,
            tipoContribuyente: 1,
            pais: "PRY",
            paisDescripcion: "Paraguay",
            documentoTipo: 1,
            documentoNumero: cliente.ci
        }
        if(cliente.dvruc != null) deCliente.ruc = `${cliente.ci}-${cliente.dvruc}`;
        if(cliente.telefono1) deCliente.telefono = cliente.telefono1;
        if(cliente.email) deCliente.email = cliente.email;
        return deCliente;
    }

    private getItems(detalles: DetalleVenta[]): DEItemInterface[]{
        const items: DEItemInterface[] = [];
        for(let detalle of detalles){
            items.push({
                codigo: `${detalle.idservicio}`,
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
        if(!this.sifenUtilsSrv.certDataExists()){
            console.log('SIFEN_CERT_FOLDER y/o SIFEN_CERT_FILENAME indefinidos en variables de entorno');
            return null;
        }

        try{
            return await xmlsign.signXML(
                xml,
                this.sifenUtilsSrv.getCertData().certFullPath,
                this.sifenUtilsSrv.getCertData().certPassword,
                true
            );
        }catch(e){
            console.error("Error al firmar digitalmente la factura", e);
            return null;
        }
    }
      
    public async generateKude(factElectronica: DTE, conDuplicado: boolean = false): Promise<StreamableFile>{
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
        await this.kudeUtils.generate(
            dteFilePath,
            jasperPath,
            kudePath,
            `{LOGO_URL: '${urlLogo}', ambiente: '${ambienteSifen}'}`
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

    public async generarDEConQR(signedXml: string): Promise<string>{
        try{
            const csc = await this.cscRepo.findOneByOrFail({activo: true});
            return await qrgen.generateQR(signedXml, `${csc.id}`, `${csc.codigoSeguridad}`, this.sifenUtilsSrv.getAmbiente());
        }catch(e){
            console.error("Error al generar y agregar QR a la factura electrónica");
            console.error(e);
            return null;
        }
    }

    public async generarFacturaElectronica(venta: Venta, detalles: DetalleVenta[]): Promise<DTE> {
        const facturaElectronica = new DTE();
        //facturaElectronica.idventa = venta.id;
        facturaElectronica.idestadoDocumentoSifen = EstadoDocumentoSifen.NO_ENVIADO;
        facturaElectronica.version = 1;
        facturaElectronica.fechaCambioEstado = new Date();
        
        const xmlDE = await this.generarDE(venta, detalles);
        const signedXmlDE = await this.generarDEFirmado(xmlDE);
        const signedWithQRXmlDE = await this.generarDEConQR(signedXmlDE);
        
        //console.log('Factura XML sin firma generada', xmlDE != null);
        //console.log('Factura XML firmado generado', signedWithQRXmlDE != null);
        //console.log('Factura XML firmado con QR generado', signedWithQRXmlDE != null);

        facturaElectronica.xml = signedWithQRXmlDE ?? signedXmlDE ?? xmlDE;
        facturaElectronica.firmado = signedXmlDE != null;
        facturaElectronica.idestadoEnvioEmail = EstadoEnvioEmail.NO_ENVIADO;
        facturaElectronica.fechaCambioEstadoEnvioEmaill = new Date();
        facturaElectronica.intentoEnvioEmail = 0;

        return facturaElectronica;
    }

    public async regenerarFacturaElectronica(venta: Venta, detalles: DetalleVenta[]): Promise<DTE> {
        
        const facturaElectronica = await this.facturaElectronicaRepo.findOneByOrFail({ id: venta.iddte });
        facturaElectronica.version = facturaElectronica.version + 1;
        
        facturaElectronica.idestadoDocumentoSifen = EstadoDocumentoSifen.NO_ENVIADO;
        facturaElectronica.fechaCambioEstado = new Date();
        
        const xmlDE = await this.generarDE(venta, detalles);
        const signedXmlDE = await this.generarDEFirmado(xmlDE);
        const signedWithQRXmlDE = await this.generarDEConQR(signedXmlDE);
        
        //console.log('Factura XML sin firma generada', xmlDE != null);
        //console.log('Factura XML firmado generado', signedWithQRXmlDE != null);
        //console.log('Factura XML firmado con QR generado', signedWithQRXmlDE != null);

        facturaElectronica.xml = signedWithQRXmlDE ?? signedXmlDE ?? xmlDE;
        facturaElectronica.firmado = signedXmlDE != null;
        facturaElectronica.idestadoEnvioEmail = EstadoEnvioEmail.NO_ENVIADO;
        facturaElectronica.fechaCambioEstadoEnvioEmaill = new Date();
        facturaElectronica.intentoEnvioEmail = 0;

        return facturaElectronica;
    }
      
}
