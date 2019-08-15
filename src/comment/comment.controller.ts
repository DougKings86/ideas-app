import { Controller, Get, Param, Post, UseGuards, UsePipes } from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from '../shared/auth.guard';
import { ValidationPipe } from '../shared/validation.pipe';
import { User } from '../user/user.decorator';

@Controller('api/comments')
export class CommentController {
    constructor(private commentService: CommentService) { }

    @Get('idea/:id')
    showComments(@Param('id') idea: string) {

    }

    @Get('user/:id')
    showCommentsByUser(@Param('id') user: string) {
    }

    @Post('idea/:id')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    createComment(@Param('id') idea: string, @User('id') user: string) {

    }

}
