import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class RequestUser {
  id!: string;
  email!: string;
  name!: string;
  role!: string;
}

export const User = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext): RequestUser | string => {
    const request = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    const user = request.user;
    return data ? (user as unknown as Record<string, unknown>)?.[data] as string : user;
  },
);
