import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Logger } from "@nestjs/common";
import * as jwt from "jsonwebtoken";


@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(
        context : ExecutionContext,
    ):  Promise<boolean> 
    {
        const request = context.switchToHttp().getRequest();
        if(!request.headers.authorization){
            return false;
        }
        request.user = await this.validateToken(request.headers.authorization);
        return true;
    }

    async validateToken(auth: string){
        if(auth.split(" ")[0].toLowerCase() !== "bearer"){ // beares <token>
            throw new HttpException('invalid Token',HttpStatus.FORBIDDEN);
        }
        try{
            const token = auth.split(" ")[1];
            const decoded = await jwt.verify(token , process.env.SECRET);
            return decoded;
        }catch(err){
            const message = `Token Error : ${err.message|| err.name}` ;
            throw new HttpException(message , HttpStatus.FORBIDDEN);
        }
    }
}
