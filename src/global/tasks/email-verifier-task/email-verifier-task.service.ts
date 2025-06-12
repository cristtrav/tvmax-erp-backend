import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser'
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { EmailInterface } from './email.interface';
import { ResultInterface } from './result.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailDesactivado } from '@database/entity/facturacion/email-desactivado.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmailVerifierTaskService {

    private workerRunning: boolean = false;

    constructor(
        @InjectRepository(EmailDesactivado)
        private emailDesactivadoRepo: Repository<EmailDesactivado>
    ){}

    @Cron("*/10 * * * *")
    async verificar(){
        if(this.workerRunning){
            console.log('Email analyzer worker still running');
            return;
        }

        const emailList: EmailInterface[] = await this.getEmailList();
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
            }
        });
    }

    private async getEmailList(): Promise<EmailInterface[]>{
        let emailList: EmailInterface[] = [];

        const client = this.getEmailClient();
        
        await client.connect();
        console.log('luego de conectar')
        let lock = await client.getMailboxLock('INBOX');
        console.log('luego de obtener el lock')
        try{
            const unseenUIDs = await client.search({ seen: false });
            
            if (unseenUIDs.length === 0) {
                console.log('No hay mensajes no leídos.');
            } else {
                
                for await (let msg of client.fetch(unseenUIDs, { uid: true, envelope: true, source: true })) {
                    const parsed = await simpleParser(msg.source);
                    emailList.push({
                        uid: msg.uid,
                        from: msg.envelope.from[0]?.address,
                        subject: msg.envelope.subject ?? '(Sin asunto)',
                        body: parsed.text
                    })
                }    
           }
        }catch(e){
            console.error('Error al conectar al servidor de email', e);
        }finally{
            lock.release();
        }
        await client.logout();
        return emailList;
    }

    private async markAsSeen(uidList: number[]){
        const client = this.getEmailClient();
        await client.connect();
        console.log('luego de conectar')
        let lock = await client.getMailboxLock('INBOX');
        console.log('luego de obtener el lock')
        try{
            for(let uid of uidList) await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true });
        }catch(e){
            console.error('Error al conectar al servidor de email', e);
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
