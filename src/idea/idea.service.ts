import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IdeaEntity } from './idea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaDTO, IdeaRO } from './idea.dto';
import { UserEntity } from '../user/user.entity';
import { Votes } from '../shared/votes.enum';

@Injectable()
export class IdeaService {
    constructor(
        @InjectRepository(IdeaEntity)
            private ideaRepository: Repository<IdeaEntity> ,
        @InjectRepository(UserEntity) 
            private userRepository: Repository<UserEntity>

    ) { }

    async showAll(): Promise<IdeaRO[]>{
        const ideas = await this.ideaRepository.find({ relations : ['author' , 'upvotes' , 'downvotes'] });
        return ideas.map((idea) => this.toResponseObject(idea));
    }

    async create(userId: string , data: Partial<IdeaDTO>): Promise<IdeaRO> {
        const user = await this.userRepository.findOne({ where : {id : userId}});
        const idea = await this.ideaRepository.create({ ...data , author: user });
        await this.ideaRepository.save(idea);
        return this.toResponseObject(idea);
    }

    async read(id: string): Promise<IdeaRO> {
        const idea = await this.ideaRepository.findOne(
            {
                where: { id } ,
                relations: ['author' , 'upvotes' , 'downvotes']
            });
        if(!idea){
            throw new HttpException('Not Found' , HttpStatus.NOT_FOUND);
        }    
        return this.toResponseObject(idea)
    }

    async update(id: string, userId: string,  data: Partial<IdeaDTO>): Promise<IdeaRO> {
        let idea = await this.ideaRepository.findOne({ where : {id} , relations : ['author']});
        //const user = await this.userRepository.findOne( {where : {id : userId}});
        if(!idea){
            throw new HttpException('Idea Not Found' , HttpStatus.NOT_FOUND );
        }
        this.ensureOwnerShip(idea , userId);
        await this.ideaRepository.update({ id }, data);
        idea =  await this.ideaRepository.findOne({
             where : {id} ,
             relations : ['author']
            });
        return this.toResponseObject(idea);
    }

    async destroy(id: string , userId: string) {
        const idea = await this.ideaRepository.findOne({ where : {id} ,  relations : ['author']});
        if(!idea){
            throw new HttpException('Idea Not Found' , HttpStatus.NOT_FOUND);
        }
        this.ensureOwnerShip(idea , userId);
        await this.ideaRepository.delete({ id });
        return this.toResponseObject(idea);
    }

    async bookmark(id: string , UserId: string){
        const idea = await this.ideaRepository.findOne({ where : {id}});
        const user = await this.userRepository.findOne({ 
            where : {
                id : UserId 
             },
             relations : ['bookmarks']});
        if(user.bookmarks.filter(bookmark => bookmark.id === idea.id).length < 1){
            user.bookmarks.push(idea);
            await this.userRepository.save(user);   
        }else{
            throw new HttpException('Idea alred bookmarked' , HttpStatus.BAD_REQUEST);
        }

        return user.toResponseObject(false);
    }

    async unbookmark( id : string , userId : string){
        const idea = await this.ideaRepository.findOne({ where : { id }});
        const user = await this.userRepository.findOne(
                { 
                    where : { id : userId },
                    relations : ['bookmarks']
                });
        if(user.bookmarks.filter( bookmark => bookmark.id === idea.id ).length > 0){
            user.bookmarks = user.bookmarks.filter( bookmark => bookmark.id !== idea.id);
            await this.userRepository.save(user);
        } else {
            throw new HttpException('User Doesn\'t bookmarked' , HttpStatus.BAD_REQUEST);
        }
        return user.toResponseObject(false);
    }

    async upvote(id: string , idUser: string){
        let idea = await this.ideaRepository.findOne({ 
                    where : { id } ,
                    relations : ['author' , 'upvotes' , 'downvotes']
            });
        const user = await this.userRepository.findOne({ where : {id : idUser}});
        
        idea = await this.vote(idea , user , Votes.UP);
        return this.toResponseObject(idea);
    }


    async downvote(id: string , idUser: string){
        let idea = await this.ideaRepository.findOne({
            where : { id },
            relations: ['author' , 'upvotes' , 'downvotes']
        });
        const user = await this.userRepository.findOne({ where : { id : idUser}});
        idea = await this.vote(idea , user , Votes.DOWN);
        return this.toResponseObject(idea);
    }


    private async vote(idea: IdeaEntity , user: UserEntity , vote: Votes ){
        const opposite = (vote === Votes.UP) ? Votes.DOWN : Votes.UP;
        // Change the vote 
        if(
         idea[opposite].filter( voter => voter.id === user.id).length > 0 ||
         idea[vote].filter( voter => voter.id === user.id).length > 0    
        ){
            idea[opposite] = idea[opposite].filter( voter => voter.id !== user.id);
            idea[vote] = idea[vote].filter(voter => voter.id !== user.id);
            await this.ideaRepository.save(idea);
        } else if(idea[vote].filter(voter => voter.id === user.id ).length < 1){
            idea[vote].push(user);
            await this;this.ideaRepository.save(idea);
        } else {
            throw new HttpException('Unable to cast Vote' , HttpStatus.BAD_REQUEST);
        }
        return idea;
    }

    private ensureOwnerShip(idea: IdeaEntity , userId: string){
        
        if(idea.author && idea.author.id !== userId){
            throw new HttpException('Incorrect user' , HttpStatus.UNAUTHORIZED);
        }
        return true;
    }

    private toResponseObject(idea: IdeaEntity): IdeaRO {
        const responseObject: any =  { ...idea , author : idea.author ? idea.author.toResponseObject(false) : null}; 
        if(responseObject.upvotes){
            responseObject.upvotes = idea.upvotes.length;
        }
        if(responseObject.downvotes){
            responseObject.downvotes = idea.downvotes.length;
        }
        return responseObject; 
    }
}
