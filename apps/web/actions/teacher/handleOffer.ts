"use server"

import { sendReplacementEmail } from "@/lib/mail";
import { db } from "@repo/db/src"

export const acceptOffer = async (replacementId: string) => {
    try {
        await db.$transaction(async (tx) => {

            const result = await tx.replacementOffer.update({
                where: { id: replacementId },
                data: { status: "ACCEPTED" },
            });
            
            await tx.replacementOffer.deleteMany({
                where: {
                    id: { not: result.id },
                    lectureId: result.lectureId
                }
            });
        });
        return true;
    } catch (error) {
        console.error("Error accepting replacement offer:", error);
        return false;
    }
}

export const declineOffer = async (replacementId: string) => {
    try {
        const rep = await db.replacementOffer.update({
            where: { id: replacementId },
            data: { status: "DECLINED" },
            include: {
                offerer: {
                    select: { email: true }
                }
            }
        });
        await sendReplacementEmail(rep.offerer.email, "DECLINED");
        return true;
    } catch (error) {
        console.error("Error declining replacement offer:", error);
        return false;
    }
}