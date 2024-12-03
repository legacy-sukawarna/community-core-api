/*
  Warnings:

  - You are about to drop the column `location` on the `ConnectAttendance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ConnectAttendance" DROP COLUMN "location",
ADD COLUMN     "notes" TEXT,
ALTER COLUMN "date" SET DATA TYPE DATE;

-- CreateIndex
CREATE INDEX "ConnectAttendance_date_idx" ON "ConnectAttendance"("date");

-- CreateIndex
CREATE INDEX "ConnectAttendance_group_id_idx" ON "ConnectAttendance"("group_id");

-- CreateIndex
CREATE INDEX "EventAttendance_user_id_event_id_idx" ON "EventAttendance"("user_id", "event_id");

-- CreateIndex
CREATE INDEX "Group_mentor_id_idx" ON "Group"("mentor_id");
