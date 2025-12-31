-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "EventLinkType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'EVENT_MANAGER';

-- CreateTable
CREATE TABLE "EventNotice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "poster_url" TEXT,
    "link" TEXT,
    "link_type" "EventLinkType" NOT NULL DEFAULT 'INTERNAL',
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "author_id" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventNotice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventNotice_status_idx" ON "EventNotice"("status");

-- CreateIndex
CREATE INDEX "EventNotice_author_id_idx" ON "EventNotice"("author_id");

-- CreateIndex
CREATE INDEX "EventNotice_published_at_idx" ON "EventNotice"("published_at");

-- AddForeignKey
ALTER TABLE "EventNotice" ADD CONSTRAINT "EventNotice_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
