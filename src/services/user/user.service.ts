import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Repository } from "typeorm";
import { User } from "src/entities/User.entity";
import { CrudRequest } from "@nestjsx/crud";
import { UserRegistrationDto } from "src/dtos/user/user.registration.dto";
import { ApiResponse } from "src/misc/api.response.class";
import * as crypto from 'crypto';

@Injectable()
export class UserService extends TypeOrmCrudService<User> {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
  ) {
    super(user);
  }

  async register(data: UserRegistrationDto): Promise<User | ApiResponse>{
    const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        const newUser: User = new User();
        newUser.email         = data.email;
        newUser.passwordHash  = passwordHashString;
        newUser.forname       = data.forname;
        newUser.surname       = data.surname;
        newUser.phoneNumber   = data.phoneNumber;
        newUser.postalAddress = data.postalAddress;

        try{
            const saveUser = await this.user.save(newUser);
            if(!saveUser){
                throw new Error('');
            }
            return saveUser;

        }catch(e){
            return new ApiResponse('error', -6001, 'This user account cannot be created.')

        }
  }

  async getById(id){
    return await this.user.findOne(id);
  }

  async getByEmail(email: string): Promise<User | null>{
    const user = await this.user.findOne({
        where:{email: email}
    });

    if(user){
        return user;
    }

    return null;
}
}