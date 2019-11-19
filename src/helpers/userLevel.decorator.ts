import { createParamDecorator, HttpException, HttpStatus } from '@nestjs/common';

export const UserLevelValidation = createParamDecorator((level, req) => {
  if (req.user.authLevel === level) {
    return req;
  }
  throw new HttpException('Insufficient Rights', HttpStatus.FORBIDDEN);
});
