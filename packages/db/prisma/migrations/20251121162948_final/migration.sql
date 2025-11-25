/*
  Warnings:

  - A unique constraint covering the columns `[studentLeaveId]` on the table `ApplicationLeave` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ApplicationLeave" DROP CONSTRAINT "ApplicationLeave_applicantId_fkey";

-- AlterTable
ALTER TABLE "ApplicationLeave" ALTER COLUMN "applicantId" DROP NOT NULL,
ALTER COLUMN "leaveRequestId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationLeave_studentLeaveId_key" ON "ApplicationLeave"("studentLeaveId");

-- AddForeignKey
ALTER TABLE "ApplicationLeave" ADD CONSTRAINT "ApplicationLeave_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
