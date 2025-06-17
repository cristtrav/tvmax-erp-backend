import { parentPort, workerData } from "node:worker_threads";
import { EmailInterface } from "./email.interface";
import { ResultInterface } from "./result.interface";
import ollama from "ollama";
import { config } from 'dotenv';
import { join } from "node:path";
import { LoggerService, Logger } from "@nestjs/common";
import { EmailVerifierTaskService } from "./email-verifier-task.service";

config({ path: join(process.cwd(), '.env')});

const logger: LoggerService = new Logger(EmailVerifierTaskService.name);

const lm: string = process.env.EMAIL_AMALYZER_LLM ?? "qwen3:1.7b"
logger.log(`Se usará el modelo ${lm} para el análisis`)


function getPrompt(email: EmailInterface): string {
    return `Te pasaré el remitente, asunto y cuerpo de un email recibido para análisis y quiero que elabores un JSON con el resultado del análisis.
    
    ## EMAIL
    Remitente: ${email.from}
    Asunto: ${email.subject}
    Cuerpo:
    ${email.body}

    ## NECESITO DETERMINAR
    * Si es un mensaje informando que un email anterior no pudo ser entregado al destinatario (delivery failed).
    * El lugar donde se produjo la falla.
    * La causa de la falla.

    ## ESTRUCTURA DEL JSON
    {
        delivered: boolean,
        errorLocation: string,
        destinationEmail: string,
        cause: string
    }

    ## CONDICIONES DE CONSTRUCCIÓN DEL JSON
    * delivered: "false" si es un mensaje de rechazo, "true" si es otro tipo de mensaje.
    * errorLocation: Si delivered es "true" poner un txto vacío "". Si delivered es "false" puede tener dos valores "sender" o "destination" segun los siguientes criterios:
        * "sender": Únicamente si el error ocurrió en el servidor de envío (Suspensión de envío de email, etc). Si el error es en el servidor de destino colocar "destination".
        * "destination": Si el error ocurrió en la dirección de destino o servidor de destino (dirección de correo inexistente, buzón del destinatario lleno, buzón del destinatario mal configurado, rechazo del servidor de destino, etc)
    * destinationEmail: Si delivered es "true" colocar un texto vacío "". Si delivered es "false" colocar la dirección de correo a la cual se dirigía el email originalmente, éste se encontrará en el cuerpo del email si es un email de error.
    * cause: tipo string. Si delivered es "true" poner un texto vacío "". Si delivered es "false" analizar el cuerpo del email buscando la causa y colocar en este campo de forma resumida. Traduce la causa al español si está en inglés.

    ## EJEMPLOS DE RESPUESTA:
    Caso en el que el resultado del analisis sea un error de entrega a causa del email del destinatario:
    {
        "delivered": false,
        "errorLocation": "destination",
        "destinationEmail": "rolonbalbuenag@gmail.com",
        "cause": "Buzón del destinatario no disponible"
    }

    Caso en el que el resultado del analisis sea un error a causa del servidor de envío:
    {
        "delivered": false,
        "errorLocation": "sender",
        "destinationEmail": "rolonbalbuenag@gmail.com",
        "cause": "La dirección facturacion@tvmaxsa.com.py tiene una suspensión de envío"
    }

    Caso en el que el resultado del analisis no sea un error de entrega del email:
    {
        "delivered": true,
        "errorLocation": "",
        "destinationEmail": "",
        "cause": ""
    }

    Asegúrate que la respuesta sea sólamente un JSON según las "CONDICIONES DE CONSTRUCCIÓN DEL JSON" con los campos: delivered, errorLocation, destinationEmail, cause`
}

async function verifyEmail(email: EmailInterface): Promise<ResultInterface> {
    logger.log(`Procesando email uid: ${email.uid}`)
    const lmResult = await ollama.generate({
        model: lm,
        prompt: getPrompt(email)
    });
    logger.log(lmResult.response);
    const parsedResult: ResultInterface = JSON.parse(lmResult.response.replace(/<think>[\s\S]*?<\/think>/gi, '').trim());
    parsedResult.uid = email.uid;
    return parsedResult;
    /*return {
        uid: 123,
        delivered: false,
        destinationEmail: email.from,
        errorLocation: 'destination',
        cause: 'Error de prueba'
    }*/
}

async function verifyEmailList(emailList: EmailInterface[]): Promise<ResultInterface[]>{
    const resultList: ResultInterface[] = [];
    for(let i = 0; i < emailList.length; i++){
        const email = await verifyEmail(emailList[i]);
        resultList.push(email);
    }
    return resultList;
}

(async () => {
    const result = await verifyEmailList(workerData);
    parentPort?.postMessage(result);
})();
