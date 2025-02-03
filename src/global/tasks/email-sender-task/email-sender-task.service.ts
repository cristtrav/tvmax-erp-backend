import { Cliente } from '@database/entity/cliente.entity';
import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { Venta } from '@database/entity/venta.entity';
import { VentaView } from '@database/view/venta.view';
import { FacturaElectronicaUtilsService } from '@modulos/sifen/sifen-utils/services/dte/factura-electronica-utils.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EstadoEnvioEmail } from '@database/entity/facturacion/estado-envio-email.entity.dto';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { Usuario } from '@database/entity/usuario.entity';
import { KudeUtilService } from '@modulos/sifen/sifen-utils/services/kude/kude-util.service';

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
        @InjectRepository(DTE)
        private facturaElectronicaRepo: Repository<DTE>,
        @InjectRepository(VentaView)
        private ventaViewRepo: Repository<VentaView>,
        @InjectRepository(Venta)
        private ventaRepo: Repository<Venta>,
        @InjectRepository(DatoContribuyente)
        private datoContribuyenteRepo: Repository<DatoContribuyente>,
        private facturaElectronicaUtil: FacturaElectronicaUtilsService,
        private datasource: DataSource,
        private kudeFacturaUtilSrv: KudeUtilService
    ){}

    @Cron('*/30 7-21 * * *')
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

    private async getFacturas(): Promise<DTE[]>{
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
            .orderBy(`${alias}.id`, 'DESC');
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

    private async getMailOptions(dte: DTE, cliente: Cliente){
        const venta = await this.ventaViewRepo.findOneBy({ iddte: dte.id });
        const razonSocial = (await this.datoContribuyenteRepo.findOneBy({ clave: DatoContribuyente.RAZON_SOCIAL })).valor;
        const nombreArchivo = `${venta.timbrado}-${venta.prefijofactura}-${venta.nrofactura.toString().padStart(7, '0')}`;
        const tipoDocumentoSubject = dte.tipoDocumento == 'NCR' ? 'Nota de Crédito Electrónica' : 'Factura Electrónica';
        const tipoDocumentoContent = dte.tipoDocumento == 'NCR' ? 'nota de crédito' : 'factura';
        return {
            from: {
                name: process.env.SMTP_NAME ?? 'Facturación TVMAX',
                address: `${process.env.SMTP_USER}`
            },
            to: `${cliente.email}`,
            subject: `${tipoDocumentoSubject} Nro ${venta.nrofactura} | ${razonSocial}`,
            text: `Estimado/a ${cliente.razonSocial}, \nAdjunto encontrará su ${tipoDocumentoContent} en formato Documento Tributario Electrónico (DTE) y su versión imprimible (KuDE). \n¡Gracias por su preferencia!`,
            html: `<h3>Estimado/a ${cliente.razonSocial},</h3>
            <p>Adjunto encontrará su ${tipoDocumentoContent} en formato Documento Tributario Electrónico (DTE) y su versión imprimible (KuDE).</p>
            <p><strong>¡Gracias por su preferencia!</strong></p>`,
            attachments: [
                {
                    filename: `${nombreArchivo}.xml`,
                    content: dte.xml,
                    contentType: 'text/xml'
                },
                {
                    filename: `${nombreArchivo}.pdf`,
                    content: (await this.kudeFacturaUtilSrv.generateKude(dte)).getStream(),
                    contentType: 'application/pdf'
                }
            ]
        }
    }

    private async sendMail(dte: DTE){
        const oldDte = { ...dte };
        const cliente = (
            await this.ventaRepo.findOne({
                where: { iddte: dte.id, anulado: false, eliminado: false },
                relations: { cliente: true }
            })
        ).cliente;
        if(cliente.email == null){
            console.log(dte.id, "Cliente sin email");
            dte.observacionEnvioEmail = "Correo no enviado. Cliente sin email";
            await this.datasource.transaction(async manager => {
                await manager.save(DTE.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldDte, dte));
                await manager.save(dte);
            });
            return;
        };
        console.log(dte.id, `Intentando enviar email a ${cliente.email}`);        
        const transporter = nodemailer.createTransport(this.getTransportConfig());
        dte.intentoEnvioEmail = dte.intentoEnvioEmail + 1;
        await this.datasource.transaction(async manager => {
            try{
                const info = await transporter.sendMail(await this.getMailOptions(dte, cliente));
                dte.idestadoEnvioEmail = EstadoEnvioEmail.ENVIADO;
                dte.fechaCambioEstadoEnvioEmaill = new Date();
                dte.observacionEnvioEmail = info.response;
            }catch(e){
                console.error(dte.id, 'Error al enviar email');
                console.error(e);
                dte.idestadoEnvioEmail = EstadoEnvioEmail.ENVIO_FALLIDO ;
                dte.fechaCambioEstadoEnvioEmaill = new Date();
                dte.observacionEnvioEmail = e;                
            }

            await manager.save(DTE.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldDte, dte));
            await manager.save(dte);
        });
        
        
    }
}
