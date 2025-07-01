import { Injectable, Logger, LoggerService, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser'
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { EmailInterface } from './email.interface';
import { ResultInterface } from './result.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailDesactivado } from '@database/entity/facturacion/email-desactivado.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';

@Injectable()
export class EmailVerifierTaskService implements OnModuleInit {
    private readonly logger: LoggerService = new Logger(EmailVerifierTaskService.name);
    private workerRunning: boolean = false;

    constructor(
        @InjectRepository(EmailDesactivado)
        private emailDesactivadoRepo: Repository<EmailDesactivado>,
        private scheduleRegistry: SchedulerRegistry,
        private configService: ConfigService
    ){}

    onModuleInit() {
        if(process.env.EMAIL_VERIFIER_DISABLED == 'TRUE') return;
        
        const cronExp = this.configService.get<string>('EMAIL_VERIFIER_CRON') || "*/10 * * * *";
        const job = new CronJob(cronExp, () => this.verificar());
        this.scheduleRegistry.addCronJob('emalVerifierTask', job);
        job.start();
        this.logger.log(`emailVerifierTask programado para ejecutarse con: ${cronExp}`)
    }

    async verificar(){
        this.logger.log('Verificando emails...')
        if(this.workerRunning){
            this.logger.log('emailVerifierWorker todavía está ejecutándose');
            return;
        }

        const emailList: EmailInterface[] = await this.getEmailList();
        this.logger.log(`${emailList.length} emails no leidos`);
        if(emailList.length == 0) return;
        const resultList: ResultInterface[] = await this.analyze(emailList);
        if(resultList.length > 0) {
            await this.markAsSeen(resultList.map(result => result.uid));
            const deactivateList = resultList.filter(res => !res.delivered && res.errorLocation == 'destination');
            await this.deactivateEmails(deactivateList);
        }
    }

    private getEmailClient(): ImapFlow {
        return new ImapFlow({
            host: process.env.SMTP_HOST,
            port: 993,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            },
            logger: false
        });
    }

    private async getEmailList(): Promise<EmailInterface[]>{
        let emailList: EmailInterface[] = [];

        const client = this.getEmailClient();
        
        await client.connect();
        let lock = await client.getMailboxLock('INBOX');
        try{
            const unseenUIDs = await client.search({ seen: false });
            
            /*if (unseenUIDs.length === 0) {
                console.log('No hay mensajes no leídos.');
            } else {*/
                
                for await (let msg of client.fetch(unseenUIDs, { uid: true, envelope: true, source: true })) {
                    const parsed = await simpleParser(msg.source);
                    emailList.push({
                        uid: msg.uid,
                        from: msg.envelope.from[0]?.address,
                        subject: msg.envelope.subject ?? '(Sin asunto)',
                        body: parsed.text
                    })
                }    
           /*}*/
        }catch(e){
            this.logger.error('Error al conectar al servidor de email', e);
        }finally{
            lock.release();
        }
        await client.logout();
        return emailList;
    }

    private async markAsSeen(uidList: number[]){
        const client = this.getEmailClient();
        await client.connect();
        let lock = await client.getMailboxLock('INBOX');
        try{
            for(let uid of uidList) await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true });
        }catch(e){
            this.logger.log('Error al conectar al servidor de email', e);
        }finally{
            lock.release();
        }
        await client.logout();
    }

    async deactivateEmails(resultList: ResultInterface[]){
        for(let result of resultList){
            const emailDesact = new EmailDesactivado();
            emailDesact.email = result.destinationEmail;
            emailDesact.fechaHora = new Date();
            emailDesact.motivo = result.cause;
            await this.emailDesactivadoRepo.save(emailDesact);
        }
    }

    private async analyze(emailList: EmailInterface[]): Promise<ResultInterface[]>{
        this.workerRunning = true;
        return new Promise<ResultInterface[]>((resolve, reject) => {
            const worker = new Worker(join(__dirname, 'email-verifier.worker.js'), {
                workerData: emailList
            });
            worker.on('message', (message) => resolve(message))
            worker.on('error', (err) => reject(err))
            worker.on('exit', (code) => {
                this.workerRunning = false
                if(code != 0) reject(new Error(`El worker de verificación de email finalizó con código: ${code}`));
            })
        });
    }

}
