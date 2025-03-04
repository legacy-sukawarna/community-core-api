-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_mentor_id_fkey";

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "mentor_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
