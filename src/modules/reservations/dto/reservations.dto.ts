import { ReservationStatus } from '@prisma/client';

export class UpdateReservationStatusDto {
  id: string;
  status: ReservationStatus;
}
