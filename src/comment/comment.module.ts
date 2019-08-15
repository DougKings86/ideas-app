import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdeaEntity } from '../idea/idea.entity';
import { UserEntity } from '../user/user.entity';
import { CommentEntity } from './comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IdeaEntity , UserEntity , CommentEntity])],
  controllers : [CommentController],
  providers: [CommentService]
})
export class CommentModule {}
