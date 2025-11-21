import { ActivityLogAction } from '@prisma/client';

export class CreateActivityLogDto {
  userId: string;
  concertId: string;
  action: ActivityLogAction;
}
