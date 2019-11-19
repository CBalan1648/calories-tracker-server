import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UserSchema } from '../users/user.schema';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jtw.strategy';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: 'HELLO_HELLO_DO_NOT_USE_THIS',
            signOptions: { expiresIn: '24h' },
        }),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    ],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],

})
export class AuthModule { }
