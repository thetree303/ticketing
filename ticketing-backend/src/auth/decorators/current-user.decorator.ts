import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Nếu có data (ví dụ: 'id'), trả về property đó
    // Nếu không có data, trả về toàn bộ user object
    return data ? user?.[data] : user;
  },
);
