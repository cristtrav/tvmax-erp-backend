import { DatoContribuyente } from '@database/entity/facturacion/dato-contribuyente.entity';
import { DTE } from '@database/entity/facturacion/dte.entity';
import { VentaView } from '@database/view/venta.view';
import { Injectable, Logger, LoggerService, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EstadoEnvioEmail } from '@database/entity/facturacion/estado-envio-email.entity.dto';
import { EstadoDocumentoSifen } from '@database/entity/facturacion/estado-documento-sifen.entity';
import { Usuario } from '@database/entity/usuario.entity';
import { KudeUtilService } from '@modulos/sifen/sifen-utils/services/kude/kude-util.service';
import { ClienteView } from '@database/view/cliente.view';
import { EmailDesactivado } from '@database/entity/facturacion/email-desactivado.entity';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';

@Injectable()
export class EmailSenderTaskService implements OnModuleInit {

    private readonly logger: LoggerService = new Logger(EmailSenderTaskService.name);

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
        @InjectRepository(ClienteView)
        private clienteViewRepo: Repository<ClienteView>,
        @InjectRepository(DatoContribuyente)
        private datoContribuyenteRepo: Repository<DatoContribuyente>,
        @InjectRepository(EmailDesactivado)
        private emailDesactivadoRepo: Repository<EmailDesactivado>,
        private datasource: DataSource,
        private kudeFacturaUtilSrv: KudeUtilService,
        private schedule: SchedulerRegistry,
        private configService: ConfigService
    ){}


    onModuleInit() {
        const cronExp = this.configService.get<string>('EMAIL_SENDER_CRON') || '*/15 7-21 * * *';
        const job = new CronJob(cronExp, () => this.enviar())
        this.schedule.addCronJob('emailSenderTask', job);
        job.start();
        this.logger.log(`emailSenderTask programado para ejecutarse con: ${cronExp}`)
    }

    async enviar(){
        if(process.env.EMAIL_SENDER_DISABLED == 'TRUE') return;

        if(!this.smtpConfigExists()){
            this.logger.warn('Parámetros SMTP no configurados en variables de entorno.');
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
            .leftJoinAndSelect(`${alias}.venta`, `venta`)
            .leftJoinAndSelect(`venta.cliente`, `cliente`)
            .andWhere(`cliente.email IS NOT NULL`)
            .andWhere(`TRIM(cliente.email) != ''`)
            .andWhere(new Brackets(qb => {
                qb = qb.orWhere(`${alias}.idestadoEnvioEmail = 1`);
                qb = qb.orWhere(`${alias}.idestadoEnvioEmail = 3`);
            }))
            .andWhere(`${alias}.intentoEnvioEmail <= :maxIntentos`, { maxIntentos: this.MAX_INTENTOS})
            .take(this.TAMANIO_LOTE)
            .orderBy(`${alias}.intentoEnvioEmail`, 'ASC')
            .addOrderBy(`${alias}.id`, 'DESC')
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
            secure: process.env.SMTP_SECURE == 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        }
    }

    private async getMailOptions(dte: DTE, cliente: ClienteView){
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
            text: `Estimado/a ${cliente.razonsocial}, \nAdjunto encontrará su ${tipoDocumentoContent} en formato Documento Tributario Electrónico (DTE) y su versión imprimible (KuDE). \n¡Gracias por su preferencia!`,
            html: `<h3>Estimado/a ${cliente.razonsocial},</h3>
            <p>Adjunto encontrará su ${tipoDocumentoContent} en formato Documento Tributario Electrónico (DTE) y su versión imprimible (KuDE).</p>            
            <p style="color: red;">No responder a este correo, es generado automáticamente por el sistema informático.</p>
            <p><strong>¡Gracias por su preferencia!</strong></p>`,
            attachments: [
                {
                    filename: `${nombreArchivo}.xml`,
                    content: dte.xml,
                    contentType: 'text/xml'
                },
                {
                    filename: `${nombreArchivo}.pdf`,
                    content: (await this.kudeFacturaUtilSrv.generateKude(dte, false, cliente.direccion)).getStream(),
                    contentType: 'application/pdf'
                }
            ]
        }
    }

    private async sendMail(dte: DTE){
        const oldDte = { ...dte };

        if(dte.intentoEnvioEmail >= this.MAX_INTENTOS){
            this.logger.warn(dte.id, `Envio fallido, límite de intentos: ${dte.intentoEnvioEmail}`);
            dte.idestadoEnvioEmail = EstadoEnvioEmail.ENVIO_FALLIDO;
            dte.fechaCambioEstadoEnvioEmaill = new Date();
            await this.datasource.transaction(async manager => {
                await manager.save(DTE.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldDte, dte));
                await manager.save(dte);
            });
            return;
        } else dte.intentoEnvioEmail = dte.intentoEnvioEmail + 1;

        const clienteView = await this.clienteViewRepo.findOneByOrFail({ id: dte.venta.cliente.id});
        if(clienteView.email == null){
            let mensaje = "Correo no enviado, cliente sin email";
            this.logger.warn(dte.id, mensaje);
            dte.observacionEnvioEmail = mensaje;
            await this.datasource.transaction(async manager => {
                await manager.save(DTE.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldDte, dte));
                await manager.save(dte);
            });
            return;
        };

        const emailDesactivado = await this.emailDesactivadoRepo.findOneBy({ email: clienteView.email });
        if(emailDesactivado){
            let mensaje = `Correo no enviado. ${clienteView.email} desactivado. Motivo: ${emailDesactivado.motivo}`
            this.logger.warn(mensaje);
            dte.observacionEnvioEmail = mensaje;

            await this.datasource.transaction(async manager => {
                await manager.save(DTE.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldDte, dte));
                await manager.save(dte);
            });
            return;
        }

        this.logger.log(dte.id, `Intentando enviar email a ${clienteView.email}`);        
        const transporter = nodemailer.createTransport(this.getTransportConfig());

        await this.datasource.transaction(async manager => {
            try{
                const info = await transporter.sendMail(await this.getMailOptions(dte, clienteView));
                dte.idestadoEnvioEmail = EstadoEnvioEmail.ENVIADO;
                dte.fechaCambioEstadoEnvioEmaill = new Date();
                dte.observacionEnvioEmail = info.response;
            }catch(e){
                console.error(dte.id, 'Error al enviar email');
                console.error(e);
                dte.observacionEnvioEmail = JSON.stringify(e);                
            }

            await manager.save(DTE.getEventoAuditoria(Usuario.ID_USUARIO_SISTEMA, 'M', oldDte, dte));
            await manager.save(dte);
        });
    }
}
