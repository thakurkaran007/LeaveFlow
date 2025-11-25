/*
  Warnings:

  - You are about to drop the column `teacher_status` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "teacher_status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "role" SET DEFAULT 'STUDENT';
