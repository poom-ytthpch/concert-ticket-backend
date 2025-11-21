import { User } from '@prisma/client';

export interface GqlContext {
  req: Request & { user?: User };
  res: Response;
}
