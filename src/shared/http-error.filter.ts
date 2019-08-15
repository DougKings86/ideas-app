import { Catch , ExceptionFilter , HttpException, ArgumentsHost, Logger, HttpStatus} from '@nestjs/common';

@Catch()
export class HttpErrorFilter implements ExceptionFilter{
    catch(exception: any , host: ArgumentsHost){
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        if(exception instanceof HttpException){
            status = exception.getStatus();
        }

        const errorResponse = {
            code : status ,
            timestamp : new Date().toLocaleDateString(),
            path : request.url,
            method : request.method,
            message : exception.message.error || exception.message || null
        };

        Logger.error(
                `${request.method} - ${request.url} `,
                JSON.stringify(errorResponse) ,
                'ExceptionFilter');
        response.status(status).json(errorResponse);
    }

}