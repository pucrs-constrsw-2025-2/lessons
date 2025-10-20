/*
  Warnings:

  - You are about to drop the `Class` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sequence,date]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_roomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Subject" DROP CONSTRAINT "Subject_lessonId_fkey";

-- DropTable
DROP TABLE "public"."Class";

-- DropTable
DROP TABLE "public"."Room";

-- CreateIndex
CREATE INDEX "Lesson_date_idx" ON "Lesson"("date");

-- CreateIndex
CREATE INDEX "Lesson_roomId_idx" ON "Lesson"("roomId");

-- CreateIndex
CREATE INDEX "Lesson_classId_idx" ON "Lesson"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_sequence_date_key" ON "Lesson"("sequence", "date");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
