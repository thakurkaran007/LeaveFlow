"use server";

import { sendRejectionEmail, sendWelcomeEmail } from "@/lib/mail";
import { db } from "@repo/db/src";

export async function approveSignupRequest(userId: string, email: string) {

  try {
    console.log(`Approving user ${userId}`);
    
    await db.user.update({
      where: { id: userId },
      data: { 
        status: "ACTIVE",
        emailVerified: new Date()
      }
    });
    
    await sendWelcomeEmail(email);
    
  } catch (error) {
    console.error("Error approving signup:", error);
    throw error;
  }
}

export async function rejectSignupRequest(userId: string, email: string) {
  try {
    console.log(`Rejecting user ${userId}`);
    
    await db.user.delete({
      where: { id: userId }
    });
    
    await sendRejectionEmail(email);
  } catch (error) {
    console.error("Error rejecting signup:", error);
    throw error;
  }
}
