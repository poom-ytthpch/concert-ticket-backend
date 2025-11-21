/*
  Warnings:

  - A unique constraint covering the columns `[userId,concertId]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Reservation_userId_concertId_idx" ON "Reservation"("userId", "concertId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_userId_concertId_key" ON "Reservation"("userId", "concertId");
