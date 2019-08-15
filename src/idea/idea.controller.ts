import { Controller, Get, Post, Put, Delete, Param, Body, UsePipes, Logger, UseGuards } from '@nestjs/common';
import { IdeaService } from './idea.service';
import { IdeaDTO } from './idea.dto';
import { ValidationPipe } from '../shared/validation.pipe';
import { AuthGuard } from '../shared/auth.guard';
import { User } from '../user/user.decorator';

@Controller('api/ideas')
export class IdeaController {
    private logger = new Logger('IdeaController');
    constructor(private ideaService: IdeaService) {}
    
    @Get()
    showAllIdeas() {
        return this.ideaService.showAll();
    }

    @Post()
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    createIdea(@User('id') userId: string , @Body() data: IdeaDTO) {
        this.logger.log(JSON.stringify(data));
        return this.ideaService.create(userId , data);
    }

    @Get(':id')
    readIdea(@Param('id') id: string) {
        return this.ideaService.read(id);
    }

    @Put(':id')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    updateIdea(@Param('id') id: string, @User('id') user ,  @Body() data: IdeaDTO) {
        console.log(user);
        this.logger.log(JSON.stringify(data));
        return this.ideaService.update(id, user, data);
    }

    @Delete(':id')
    @UseGuards(new AuthGuard())
    destroyIdea(@Param('id') id: string , @User('id') user: string ) {
        return this.ideaService.destroy(id , user) ;
    }


    @Post(':id/upvote')
    @UseGuards(new AuthGuard())
    upvoteIdea(@Param('id') id : string , @User('id') idUser : string){
        return this.ideaService.upvote(id , idUser);
    }

    @Post(':id/downvote')
    @UseGuards(new AuthGuard())
    downvoteIdea(@Param('id') id : string , @User('id') idUser : string){
        return this.ideaService.downvote(id , idUser);
    }

    @Post(':id/bookmark')
    @UseGuards(new AuthGuard())
    bookmarkIdea(@Param('id') id: string , @User('id') userId: string){
          return this.ideaService.bookmark(id , userId);            
    }

    @Delete(':id/unbookmark')
    @UseGuards(new AuthGuard())
    unbookmarkIdea(@Param('id') id: string , @User('id') userId: string){
          return this.ideaService.unbookmark(id , userId);
    }
}
