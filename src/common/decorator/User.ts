import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { AccessUser } from 'src/module/auth/auth.type';

export const User = createParamDecorator((_, ctx: ExecutionContext) => {
  // const request = ctx.switchToHttp().getRequest();
  // return request.user as AccessUser;
});
