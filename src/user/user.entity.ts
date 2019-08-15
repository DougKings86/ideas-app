import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, BeforeInsert , Index, OneToMany, ManyToMany, JoinTable} from "typeorm";
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken'; 
import { UserRO } from "./user.dto";
import { IdeaEntity } from "../idea/idea.entity";


@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    created: Date;

    @Index({ unique: true })
    @Column()
    username: string;

    @Column('text')
    password: string;

    @OneToMany( type => IdeaEntity , idea => idea.author)
    ideas: IdeaEntity[];

    @ManyToMany( type => IdeaEntity , {cascade : true})
    @JoinTable()
    bookmarks: IdeaEntity[];

    @BeforeInsert()
    async HashPassword(){
        this.password = await bcrypt.hash(this.password , 10);
    }

    toResponseObject( showtoken: boolean = true): UserRO{
        const {id, created , username , token} = this;
        const responseObject: any = {id , created , username };
        if(showtoken){
            responseObject.token = token;
        }
        if(this.ideas){
            responseObject.ideas = this.ideas;
        }
        if(this.bookmarks){
            responseObject.bookmarks = this.bookmarks;
        }
        return responseObject;
    }

    async comparePassword(attempt: string ){
        return await bcrypt.compare(attempt , this.password);

    }
    private get token(){
        const {id , username} = this;
        return jwt.sign(
           {
               id,
               username 
           },
           process.env.SECRET ,
           { expiresIn : '7d'}
        );
    }
}