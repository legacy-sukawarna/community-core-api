/*
  Warnings:

  - A unique constraint covering the columns `[google_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "encounter" BOOLEAN DEFAULT false,
ADD COLUMN     "equip" BOOLEAN DEFAULT false,
ADD COLUMN     "establish" BOOLEAN DEFAULT false,
ADD COLUMN     "google_id" TEXT,
ADD COLUMN     "is_baptized" BOOLEAN DEFAULT false,
ADD COLUMN     "is_committed" BOOLEAN DEFAULT false,
ADD COLUMN     "kom_100" BOOLEAN DEFAULT false,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_google_id_key" ON "User"("google_id");
