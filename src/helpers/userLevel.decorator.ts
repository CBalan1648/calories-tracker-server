import { createParamDecorator, HttpException, HttpStatus } from '@nestjs/common';

export const UserLevelValidation = createParamDecorator((level, req) => {
  if (req.user.authLevel === level) {
    return req;
  }
  throw new HttpException('Insufficient Rights', HttpStatus.FORBIDDEN);
});

export const OwnerValidation = createParamDecorator((level, req) => {

    if (req.user._id === req.params.id) {
      return req;
    }
    throw new HttpException('Insufficient Rights', HttpStatus.FORBIDDEN);
});
