"use server"

import { auth } from "@/auth"
import { sendReplacementEmail } from "@/lib/mail";
import { db } from "@repo/db/src"

export const approveReplacementRequest = async (
    requestId: string
)  => {
    const session = await auth();
    
    try {
        await db.$transaction(async (tx) => {
        const rep = await tx.replacementOffer.update({
            where: { id: requestId },
            data: {
                approverId: session?.user?.id,
            },
            include: {
                offerer: {
                    select: {
                        email: true
                    }
                },
            }
        })
        await tx.lecture.update({
            where: { id: rep.lectureId },
            data: {
                teacherId: rep.accepterId
            }
        })
        await tx.lecture.update({
            where: { id: rep.replaceLectureId! },
            data: {
                teacherId: rep.offererId
            }
        })
        await sendReplacementEmail(rep.offerer.email, "APPROVED");
    })
    } catch (error) {
        return {error}
    }
}

export const rejectReplacementRequest = async (
    reqId: string,
    lectureId: string,
) => {
    try {
        await db.$transaction(async (tx) => {

        const req = await tx.replacementOffer.update({
            where: { id: reqId },
            data: {
                approverId: null,
                status: "DECLINED"
            },
            include: {
                offerer: {
                    select: {
                        email: true
                    }
                }
            }
        })

        await sendReplacementEmail(req.offerer.email, "DECLINED")
    })
        return {success: true};    
    } catch (error) {
        return {error}
    }
}
