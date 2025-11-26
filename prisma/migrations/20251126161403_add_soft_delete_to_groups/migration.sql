-- AlterTable
ALTER TABLE "public"."Group" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Group_deleted_at_idx" ON "public"."Group"("deleted_at");
