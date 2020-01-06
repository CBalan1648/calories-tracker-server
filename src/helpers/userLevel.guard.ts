import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SELF } from './userLevel.constants';

@Injectable()
export class UserLevelGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        const isSelf = roles.includes(SELF) && request.params.id === user._id;

        const isAuthorized = roles.includes(user.authLevel);

        return user && (isAuthorized || isSelf);
    }
}
