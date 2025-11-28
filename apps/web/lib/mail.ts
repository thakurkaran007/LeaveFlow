import { Resend } from "resend";
import bcrypt from "bcryptjs";
import { getVerificationTokenByEmail } from "@/data/verification-token";
import { db } from "@repo/db/src";

const resend = new Resend(process.env.RESEND_KEY);

export const sendVerificationMail = async (email: string, token: string) => {
    const confirmLink = `http://${process.env.DOMAIN}/auth/new-verification?token=${token}`;
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h1 style="text-align: center; color: #4CAF50;">Confirm Your Email</h1>
            <p>Hi,</p>
            <p>Thanks for signing up! Please confirm your email address by clicking the link below:</p>
            <a href="${confirmLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Email</a>
            <p>If you didn’t sign up for this account, please ignore this email.</p>
            <p>Thanks,<br>The Team</p>
        </div>
    `;

    await resend.emails.send({
        from: "no-reply@thakurkaran.xyz",
        to: email,
        subject: "Confirm Your Email",
        html: htmlContent,
    });
};

export const sendOtp = async (email: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires = new Date(new Date().getTime() + 60 * 1000); // Expires in 1 minute

    const existingToken = await getVerificationTokenByEmail(email);
    if (existingToken) {
        await db.verificationToken.delete({
            where: {
                id: existingToken.id,
            },
        });
    }

    await db.verificationToken.create({
        data: {
            token: hashedOtp,
            expires,
            email,
        },
    });

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h1 style="text-align: center; color: #4CAF50;">Your OTP Code</h1>
            <p>Hi,</p>
            <p>Your one-time password (OTP) for verification is:</p>
            <p style="font-size: 24px; font-weight: bold; text-align: center; color: #333;">${otp}</p>
            <p>This code is valid for 1 minute. If you didn’t request this, please ignore this email.</p>
            <p>Thanks,<br>The Team</p>
        </div>
    `;

    await resend.emails.send({
        from: "no-reply@thakurkaran.xyz",
        to: email,
        subject: "Your OTP Code",
        html: htmlContent,
    });
};

export const sendWelcomeEmail = async (email: string) => {
    const signinLink = `http://${process.env.DOMAIN}/auth/login`;
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h1 style="text-align: center; color: #4CAF50;">Welcome to Our Platform!</h1>
            <p>Hi,</p>
            <p>We're excited to have you on board! Thank you for joining our community.</p>
            <p>You can sign in to your account using the link below:</p>
            <a href="${signinLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Sign In</a>
            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
            <p>Thanks,<br>The Team</p>
        </div>
    `;

    await resend.emails.send({
        from: "no-reply@thakurkaran.xyz",
        to: email,
        subject: "Welcome to Our Platform!",
        html: htmlContent,
    });
}

export const sendRejectionEmail = async (email: string) => {    
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h1 style="text-align: center; color: #FF0000;">Signup Request Rejected</h1>
            <p>Hi,</p>
            <p>We regret to inform you that your signup request has been rejected.</p>
            <p>If you have any questions or need further information, please feel free to contact our support team.</p>
            <p>Thanks,<br>The Team</p>
        </div>
    `;

    await resend.emails.send({
        from: "no-reply@thakurkaran.xyz",
        to: email,
        subject: "Signup Request Rejected",
        html: htmlContent,
    });
}

export const sendLeaveApprovedEmail = async (email: string) => {
    const link = `http://${process.env.DOMAIN}/home/leaves`;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h1 style="text-align: center; color: #4CAF50;">Leave Request Approved</h1>
            <p>Hi,</p>
            <p>Your leave request has been approved. You can view the details by clicking the link below:</p>
            <a href="${link}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Leave Details</a>
            <p>If you have any questions, please feel free to contact our support team.</p>
            <p>Thanks,<br>The Team</p>
        </div>
    `;

    await resend.emails.send({
        from: "no-reply@thakurkaran.xyz",
        to: email,
        subject: "Leave Request Approved",
        html: htmlContent,
    });
}

export const sendLeaveDeniedEmail = async (email: string) => {
    const link = `http://${process.env.DOMAIN}/home/leaves`;
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h1 style="text-align: center; color: #FF0000;">Leave Request Denied</h1>
            <p>Hi,</p>
            <p>We regret to inform you that your leave request has been denied.</p>
            <a href="${link}" style="display: inline-block; background-color: #FF0000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Leave Details</a>
            <p>If you have any questions or need further information, please feel free to contact our support team.</p>
            <p>Thanks,<br>The Team</p>
        </div>
    `;

    await resend.emails.send({
        from: "no-reply@thakurkaran.xyz",
        to: email,
        subject: "Leave Request Denied",
        html: htmlContent,
    });
}

export const sendReplacementEmail = async (email: string, status: "APPROVED" | "DECLINED") => {
    const subject = status === "APPROVED" ? "Replacement Request Approved" : "Replacement Request Declined";
    const color = status === "APPROVED" ? "#4CAF50" : "#FF0000";
    const actionText = status === "APPROVED" ? "View Replacement Details" : "View Replacement Details";
    const actionLink = `http://${process.env.DOMAIN}/home/replacements`;
    
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h1 style="text-align: center; color: ${color};">${subject}</h1>
            <p>Hi,</p>
            <p>Your replacement request has been ${status.toLowerCase()}.</p>
            <a href="${actionLink}" style="display: inline-block; background-color: ${color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">${actionText}</a>
            <p>If you have any questions, please feel free to contact our support team.</p>
            <p>Thanks,<br>The Team</p>
        </div>
    `;

    await resend.emails.send({
        from: "no-reply@thakurkaran.xyz",
        to: email,
        subject: subject,
        html: htmlContent,
    });
    console.log("Email Sent to: ", email);
}