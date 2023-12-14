import { Body, Controller, Post, Put, Req } from "@nestjs/common";
import { resolve } from "path";
import { LoginAdministratorDto } from "src/dtos/administrator/login.administrator.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { AdministratorService } from "src/services/administrator/administrator.service";
import * as crypto from 'crypto';
import { LoginInfoAdministratorDto } from "src/dtos/administrator/login.info.administrator.dto";
import * as jwt from 'jsonwebtoken'
import { JwtDataAdministratorDto } from "src/dtos/administrator/jwt.data.administrator.dto";
import { Request } from "express";
import { jwtSecret } from "config/jwt.secret";
import { UserRegistrationDto } from "src/dtos/user/user.registration.dto";
import { UserService } from "src/services/user/user.service";


@Controller('auth/')

export class AuthController {
    constructor(
        public administratorService: AdministratorService,
        public userService: UserService

    ) { }

    @Post('login') //http://localhost:3000/auth/login
    async doLogin(@Body() data: LoginAdministratorDto, @Req() req: Request): Promise<LoginInfoAdministratorDto | ApiResponse>{
        const administrator = await this.administratorService.getByUsername(data.username);

        if(!administrator){ // ako user ne postoji
            return new Promise(resolve=>{
                resolve(new ApiResponse('error', -3001, 'Administrator nije pronadjen!')) // -3001 = administrator nije pronadjen
            })
        }

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);

        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        if(administrator.passwordHash !== passwordHashString){ // adminova lozinka nije dobra, ne poklapa se
            return new Promise(resolve=>{
                resolve(new ApiResponse('error', -3002)) // -3002 = password koji je korisnik ukucao u u ovaj dto nije ispravan
            })
        }

        //vratiti informacije o uspesnom logovanju 

        ///administratorId
        ///username
        ///token (JWT)

        // TAJNA SIFRA
        // JSON = { administratorId, username, exp, ip, ua}
        // exp je datum kada istice token
        // ua je user agent
        // mehanizam sifrovanja Sifrovanje ( TAJNA SIFRA -> JSON) -> Sifrat binarni -> BASE64/HEX
        // HEXSTRING / HEX

        const jwtData = new JwtDataAdministratorDto();
        jwtData.administratorId = administrator.administratorId;
        jwtData.username = administrator.username;

        let sada = new Date();
        sada.setDate(sada.getDate() + 14);
        const istekTimeStamp = sada.getTime() / 1000;
        jwtData.exp = istekTimeStamp;

        jwtData.ip = req.ip.toString();
        jwtData.ua = req.headers["user-agent"];


        let token: string = jwt.sign(jwtData.toPlainObject(), jwtSecret); //GEN!!!


        const responseObject = new LoginInfoAdministratorDto(
            administrator.administratorId,
            administrator.username,
            token
        );

        return new Promise( resolve => resolve(responseObject));

    }


    @Put('user/register') // PUT http://localhost:3000/auth/user/register/
    async userRegister(@Body() data: UserRegistrationDto){
        return await this.userService.register(data);
    }
}