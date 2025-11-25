"use server";

import { auth } from "@/auth";
import { sendLeaveApprovedEmail, sendLeaveDeniedEmail } from "@/lib/mail";
import { db } from "@repo/db/src";

export async function approveStudentLeaveRequest(leaveId: string, hasApplication: boolean) {
  try {
    console.log(`Approving leave ${leaveId}, hasApplication: ${hasApplication}`);
    const result = await db.studentLeaveRequest.update({
      where: { id: leaveId },
      data: { status: "APPROVED" },
      include: {
        student: { select: { email: true } }
      }
    });
    await sendLeaveApprovedEmail(result.student.email);
  } catch (error) {
    console.error("Error approving leave:", error);
    throw error;
  }
}

export async function rejectStudentLeaveRequest(leaveId: string, hasApplication: boolean) {
  
  try {
    console.log(`Rejecting leave ${leaveId}, hasApplication: ${hasApplication}`);


    if (!hasApplication) {
      const result = await db.studentLeaveRequest.update({
      where: { id: leaveId },
      data: { 
        status: "DENIED"
      },
      include: {
        student: { select: { email: true } }
      }
    });
    await sendLeaveDeniedEmail(result.student.email);
    return;
    }
    const result = await db.studentLeaveRequest.delete({
      where: { id: leaveId },
      include: {
        student: { select: { email: true } }
      }
    });
    await sendLeaveDeniedEmail(result.student.email);

  } catch (error) {
    console.error("Error rejecting leave:", error);
    throw error;
  }
}


export const todayLeave = async() => {
  const session = await auth();
  if(!session?.user) throw new Error("Not authenticated");
  
  const leaves = await db.studentLeaveRequest.findMany({
    where: {
      studentId: session.user.id,
      createdAt: {
        gte: new Date(new Date().setHours(0,0,0,0)),
        lt: new Date(new Date().setHours(23,59,59,999))
      }
    }
  });
  return leaves.length ? true : false;
}

export const createLeave = async() => {
  const session = await auth();
  if(!session?.user.id) throw new Error("Not authenticated");

  await db.studentLeaveRequest.create({
    data: {
      studentId: session.user.id,
      status: "PENDING"
    }
  })
  return true;
}