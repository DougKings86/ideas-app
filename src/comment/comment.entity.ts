import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { IdeaEntity } from "../idea/idea.entity";


@Entity('comment')
export class CommentEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn('created')
    created: Date;

    @UpdateDateColumn('updated')
    updated: Date;

    @ManyToOne( type => UserEntity)
    author: UserEntity;

    @ManyToOne( type => IdeaEntity , idea => idea.comments )
    idea: IdeaEntity;


}