import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, BeforeInsert , Index} from "typeorm";
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken'; 
import { UserRO } from "./user.dto";


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