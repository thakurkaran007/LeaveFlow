/*
  Warnings:

  - A unique constraint covering the columns `[teacherId,date,timeSlotId]` on the table `Lecture` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'STUDENT';

-- DropIndex
DROP INDEX "Lecture_teacherId_subjectId_date_timeSlotId_key";

-- AlterTable
ALTER TABLE "ApplicationLeave" ADD COLUMN     "studentLeaveId" TEXT;

-- AlterTable
ALTER TABLE "Lecture" ADD COLUMN     "studentId" TEXT;

-- CreateTable
CREATE TABLE "studentLeaveRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "hodApprovalStatus" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studentLeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "studentLeaveRequest_applicationId_key" ON "studentLeaveRequest"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Lecture_teacherId_date_timeSlotId_key" ON "Lecture"("teacherId", "date", "timeSlotId");

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studentLeaveRequest" ADD CONSTRAINT "studentLeaveRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studentLeaveRequest" ADD CONSTRAINT "studentLeaveRequest_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ApplicationLeave"("id") ON DELETE CASCADE ON UPDATE CASCADE;
