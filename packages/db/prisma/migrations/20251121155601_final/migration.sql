/*
  Warnings:

  - You are about to drop the column `hodApprovalStatus` on the `studentLeaveRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "studentLeaveRequest" DROP COLUMN "hodApprovalStatus",
ADD COLUMN     "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING';
