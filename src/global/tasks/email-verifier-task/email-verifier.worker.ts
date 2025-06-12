import { parentPort, workerData } from "node:worker_threads";
import { EmailInterface } from "./email.interface";
import { ResultInterface } from "./result.interface";
import ollama from "ollama";

const lm: string = "qwen3:1.7b"

function getPrompt(email: EmailInterface): string {
    return `Te pasaré el remitente, asunto y cuerpo de un email recibido para análisis. Necesito determinar lo siguiente:
    - Si es un mensaje informando que un email anterior no pudo ser entregado al destinatario (delivery failed).
    - El lugar donde se produjo la falla.
    - La causa de la falla.

    Dame la respuesta del análisis en un texto en formato JSON con los siguientes atributos:
    - delivered -> tipo boolean. "false" si es un mensaje de rechazo, "true" si es otro tipo de mensaje.
    - errorLocation -> tipo string. Si delivered es "true" poner un txto vacío "". Si delivered es "false" puede tener dos valores "sender" o "destination" segun los siguientes criterios:
        -- "sender": Únicamente si el error ocurrió en el servidor de envío (Suspensión de envío de email, etc). Si el error es en el servidor de destino colocar "destination".
        -- "destination": Si el error ocurrió en la dirección de destino o servidor de destino (dirección de correo inexistente, buzón del destinatario lleno, buzón del destinatario mal configurado, rechazo del servidor de destino, etc)
    - destinationEmail -> Tipo string. Si delivered es "true" colocar un texto vacío "". Si delivered es "false" colocar la dirección de correo a la cual se dirigía el email originalmente, éste se encontrará en el cuerpo del email si es un email de error.
    - cause -> tipo string. Si delivered es "true" poner un texto vacío "". Si delivered es "false" analizar el cuerpo del email buscando la causa y colocar en este campo de forma resumida. Traduce la causa al español si está en inglés.

    Ejemplo de respuesta en caso de que el resultado del analisis sea un error de entrega a causa del email del destinatario:
    {
        "delivered": false,
        "errorLocation": "destination",
        "destinationEmail": "rolonbalbuenag@gmail.com",
        "cause": "Buzón del destinatario no disponible"
    }

    Ejemplo de respuesta en caso de que el resultado del analisis sea un error a causa del servidor de envío:
    {
        "delivered": false,
        "errorLocation": "sender",
        "destinationEmail": "rolonbalbuenag@gmail.com",
        "cause": "La dirección facturacion@tvmaxsa.com.py tiene una suspensión de envío"
    }

    Ejemplo de respuesta en caso de que el resultado del analisis no sea un error de entrega del email:
    {
        "delivered": true,
        "errorLocation": "",
        "destinationEmail": "",
        "cause": ""
    }

    A continuacíon el EMAIL:
    REMITENTE: ${email.from}
    ASUNTO: ${email.subject}
    CUERPO:
    ${email.body}`
}

async function verifyEmail(email: EmailInterface): Promise<ResultInterface> {
    console.log(`Procesando email uid: ${email.uid}`)
    const lmResult = await ollama.generate({
        model: lm,
        prompt: getPrompt(email)
    });
    
    console.log('LM Result', lmResult.response);
    const parsedResult: ResultInterface = JSON.parse(lmResult.response.replace(/<think>[\s\S]*?<\/think>/gi, '').trim());
    console.log('Parsed lm result', parsedResult)
    parsedResult.uid = email.uid;
    return parsedResult;
    /*return {
        delivered: false,
        destinationEmail: email.from,
        errorLocation: 'recipient',
        cause: 'TEST DE ERROR'
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
