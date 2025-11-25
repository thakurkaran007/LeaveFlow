"use server"

import { sendLeaveApprovedEmail, sendLeaveDeniedEmail } from "@/lib/mail";
import { db } from "@repo/db/src";

export async function approveLeaveRequest(
  requestId: string, 
  approverId: string,
  userRole: string
) {
  if (userRole === "HOD") {
    // Approve and mark for Admin review
    await db.leaveRequest.update({
      where: { id: requestId },
      data: {
        approverId: approverId
      }
    });
  } else if (userRole === "ADMIN") {
    // Final approval
    await db.$transaction(async (tx) => {
      const lr = await tx.leaveRequest.update({
          where: { id: requestId },
          data: {
            status: "APPROVED",
            approverId: approverId,
          },
          include: {
            replacementOffers: {
              select: {
                offererId: true,
                accepterId: true,
              }
            },
            lecture: {
              select: {
                id: true
              }
            }
          }
      });
      const lec = await tx.lecture.update({
        where: { id: lr.lecture.id },
        data: {
          teacherId: lr.replacementOffers[0].accepterId,
        }, include: {
          teacher: {
            select: {
              email: true
            }
          }
        }
      })
      await sendLeaveApprovedEmail(lec.teacher.email);
    })
  }
}

export async function rejectLeaveRequest(
  requestId: string,  
  approverId: string
) {
   await db.$transaction(async (tx) => {
        const leaveRequest = await tx.leaveRequest.update({
            where: { id: requestId },
            data: { 
                status: "DENIED",
                approverId: approverId 
            },
            include: {
              requester: {
                select: {
                  email: true
                }
              }
            }
        });
        await tx.replacementOffer.updateMany({
            where: { 
                lectureId: leaveRequest.lectureId 
            },
            data: { 
                status: "DECLINED",
                message: `Leave request was denied. Reason: ${'N/A'}`
            }
        });
        await sendLeaveDeniedEmail(leaveRequest.requester.email);
    });
}