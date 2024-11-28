import { Cliente } from '@database/entity/cliente.entity';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { FacturaElectronica } from '@database/entity/facturacion/factura-electronica.entity';
import { Venta } from '@database/entity/venta.entity';
import { VentaView } from '@database/view/venta.view';
import { FacturaElectronicaUtilsService } from '@modulos/ventas/service/factura-electronica-utils.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EstadoEnvioEmail } from '@database/entity/facturacion/estado-envio-email.entity.dto';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';

@Injectable()
export class EmailSenderTaskService {

    private readonly MAX_INTENTOS: number =
        Number.isInteger(Number(process.env.EMAIL_MAX_INTENTOS)) ?
        Number(process.env.EMAIL_MAX_INTENTOS) :
        5;
    private readonly TIEMPO_ESPERA_MILIS: number =
        Number.isInteger(Number(process.env.EMAIL_TIEMPO_ESPERA_MILIS)) ?
        Number(process.env.EMAIL_TIEMPO_ESPERA_MILIS) :
        2000;
    private readonly TAMANIO_LOTE: number =
        Number.isInteger(Number(process.env.EMAIL_TAMANIO_LOTE)) ?
        Number(process.env.EMAIL_TAMANIO_LOTE) :
        200;

    constructor(
        @InjectRepository(FacturaElectronica)
        private facturaElectronicaRepo: Repository<FacturaElectronica>,
        @InjectRepository(VentaView)
        private ventaViewRepo: Repository<VentaView>,
        @InjectRepository(Venta)
        private ventaRepo: Repository<Venta>,
        private facturaElectronicaUtil: FacturaElectronicaUtilsService,
        @InjectRepository(DatoContribuyente)
        private datoContribuyenteRepo: Repository<DatoContribuyente>        
    ){}

    @Cron('*/30 * * * *')
    async enviar(){
        if(process.env.EMAIL_SENDER_DISABLED == 'TRUE') return;

        if(!this.smtpConfigExists()){
            console.log('Parámetros SMTP no configurados en variables de entorno.');
            return;
        }
        const facturas = await this.getFacturas();
        facturas.forEach((f, index) => {
            setTimeout(async() => {                
               await this.sendMail(f);    
            }, (this.TIEMPO_ESPERA_MILIS * index));
        })
    }

    private async getFacturas(): Promise<FacturaElectronica[]>{
        const alias = 'fact';
        const ambienteSifen = process.env.SIFEN_AMBIENTE ?? 'test';
        let query = this.facturaElectronicaRepo
            .createQueryBuilder(alias)
            .andWhere(new Brackets(qb => {
                qb = qb.orWhere(`${alias}.idestadoEnvioEmail = 1`);
                qb = qb.orWhere(`${alias}.idestadoEnvioEmail = 3`);
            }))
            .andWhere(`${alias}.intentoEnvioEmail <= :maxIntentos`, { maxIntentos: this.MAX_INTENTOS})
            .take(this.TAMANIO_LOTE)
            .orderBy(`${alias}.idventa`, 'DESC');
            if(ambienteSifen == 'prod') query = query.andWhere(new Brackets((qb) => {
                qb = qb.orWhere(`${alias}.idestadoDocumentoSifen = :idestadoAprobado`, { idestadoAprobado: EstadoDocumentoSifen.APROBADO });
                qb = qb.orWhere(`${alias}.idestadoDocumentoSifen = :idestadoAprobadoObs`, { idestadoAprobadoObs: EstadoDocumentoSifen.APROBADO_CON_OBS });
            }));
        return query.getMany();
    }

    private smtpConfigExists(): boolean {
        return process.env.SMTP_HOST != null &&
            process.env.SMTP_PORT != null &&
            process.env.SMTP_USER != null &&
            process.env.SMTP_PASSWORD != null;
    }

    private getTransportConfig(){
        return {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE != null ? process.env.SMTP_SECURE == 'true' : false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        }
    }

    private async getMailOptions(factE: FacturaElectronica, cliente: Cliente){
        const venta = await this.ventaViewRepo.findOneBy({ id: factE.idventa });
        const razonSocial = (await this.datoContribuyenteRepo.findOneBy({ clave: DatoContribuyente.RAZON_SOCIAL })).valor;
        const nombreArchivo = `${venta.timbrado}-${venta.prefijofactura}-${venta.nrofactura.toString().padStart(7, '0')}`;
        return {
            from: {
                name: process.env.SMTP_NAME ?? 'Facturación TVMAX',
                address: `${process.env.SMTP_USER}`
            },
            to: `${cliente.email}`,
            subject: `Factura Electrónica Nro ${venta.nrofactura} | ${razonSocial}`,
            text: `Estimado/a ${cliente.razonSocial}, \nAdjunto encontrará su factura en formato Documento Tributario Electrónico (DTE) y su versión imprimible (KuDE). \n¡Gracias por su preferencia!`,
            html: `<h3>Estimado/a ${cliente.razonSocial},</h3>
            <p>Adjunto encontrará su factura en formato Documento Tributario Electrónico (DTE) y su versión imprimible (KuDE).</p>
            <p><strong>¡Gracias por su preferencia!</strong></p>`,
            attachments: [
                {
                    filename: `${nombreArchivo}.xml`,
                    content: factE.documentoElectronico,
                    contentType: 'text/xml'
                },
                {
                    filename: `${nombreArchivo}.pdf`,
                    content: (await this.facturaElectronicaUtil.generateKude(factE)).getStream(),
                    contentType: 'application/pdf'
                }
            ]
        }
    }

    private async sendMail(facturaElectronica: FacturaElectronica){
        const cliente = (
            await this.ventaRepo.findOne({
                where: { id: facturaElectronica.idventa },
                relations: { cliente: true }
            })
        ).cliente;
        if(cliente.email == null){
            console.log(facturaElectronica.idventa, "Cliente sin email");
            facturaElectronica.observacionEnvioEmail = "Correo no enviado. Cliente sin email";
            await this.facturaElectronicaRepo.save(facturaElectronica);
            return;
        };
        console.log(facturaElectronica.idventa, `Intentando enviar email a ${cliente.email}`);        
        const transporter = nodemailer.createTransport(this.getTransportConfig());
        facturaElectronica.intentoEnvioEmail = facturaElectronica.intentoEnvioEmail + 1;
        try{
            const info = await transporter.sendMail(await this.getMailOptions(facturaElectronica, cliente));
            facturaElectronica.idestadoEnvioEmail = EstadoEnvioEmail.ENVIADO;
            facturaElectronica.fechaCambioEstadoEnvioEmaill = new Date();
            facturaElectronica.observacionEnvioEmail = info.response;
            await this.facturaElectronicaRepo.save(facturaElectronica);
        }catch(e){
            console.error(facturaElectronica.idventa, 'Error al enviar email');
            console.error(e);
            facturaElectronica.idestadoEnvioEmail = EstadoEnvioEmail.ENVIO_FALLIDO ;
            facturaElectronica.fechaCambioEstadoEnvioEmaill = new Date();
            facturaElectronica.observacionEnvioEmail = e;
            await this.facturaElectronicaRepo.save(facturaElectronica);
        }
        
    }
}
