import { Controller, Get , Post, Body, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO } from './user.dto';
import { AuthGuard } from '../shared/auth.guard';


@Controller()
export class UserController {
    constructor(private userService: UserService){}
    @Get('api/users')
    @UseGuards(new AuthGuard())
    showAllUsers(){
        return this.userService.showAll();
    }
    
    @Post('login')
    @UsePipes(new ValidationPipe())
    login(@Body() data: UserDTO){
        return this.userService.login(data);
    };

    @Post('register')
    @UsePipes(new ValidationPipe())
    register(@Body() data: UserDTO){
        return this.userService.register(data);
    }
}
