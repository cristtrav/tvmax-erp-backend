import { ArgumentsHost, ExceptionFilter, ForbiddenException, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { EntityNotFoundError, QueryFailedError } from "typeorm";
import { AppExceptionResponse } from "./app-exception-response.interface";

export class HttpExceptionFilter implements ExceptionFilter{

    private getExceptionResponse(exception, request: Request): AppExceptionResponse {
        let message: string = 'Ocurrió un error';
        let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
        if(exception instanceof ForbiddenException){
            message = `No autorizado para realizar la acción sobre el recurso «${this.getResourceStr(request.path)}»`
            statusCode = HttpStatus.FORBIDDEN
        }else
        if(exception instanceof EntityNotFoundError){
            let entity: string = 'Indefinido';
            let criteria: string = '{vacío}';
            if(exception.message.includes('entity of type') && exception.message.includes('matching')){
                entity = exception.message.substring(
                    exception.message.indexOf("entity of type")+"entity of type".length,
                    exception.message.indexOf("matching")
                ).trim().replace(new RegExp('"', 'g'), '');
            }
            criteria = exception.message.substring(
                exception.message.indexOf('{')+1,
                exception.message.indexOf('}')
            ).replace(new RegExp(':', 'g'), '=');
            message = `No se encontró ningún recurso «${entity}» que cumpla con: ${criteria}`;
            statusCode = HttpStatus.NOT_FOUND
        }else
        if(exception instanceof QueryFailedError){
            console.log(exception.query);
            message = exception.message;
        }else
        if(exception instanceof HttpException){
            message = exception.message;
            statusCode = exception.getStatus();
        }
        else {
            message = exception.toString();
        }
        return {
            error: `Error al ${this.getActionName(request.method)}`,
            message,
            statusCode
        };
    }

    private getActionName(method: string): string{
        if(method === 'GET') return 'consultar 🔍';
        if(method === 'POST') return 'registrar 📄';
        if(method === 'PUT') return 'editar ✏️';
        if(method === 'DELETE') return 'eliminar 🗑️';
        return 'operar con';
    }

    private getResourceStr(path: string): string{
        let resStr: string = path;
        if(path.includes('/api/')) resStr = path.substring(5);
        return resStr;
    }

    catch(exception: any, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const response: Response = context.getResponse<Response>();
        const request: Request = context.getRequest<Request>();

        console.log('Se capturo el error en el filter');
        console.error(exception)
        const exceptionResponse: AppExceptionResponse = this.getExceptionResponse(exception, request);

        response
        .status(exceptionResponse.statusCode)
        .json(exceptionResponse);
    }

}