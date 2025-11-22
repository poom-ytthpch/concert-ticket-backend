import { User } from '@prisma/client';
import { Request, Response } from 'express';

export interface GqlContext {
  req: Request & { user?: User };
  res: Response;
}
