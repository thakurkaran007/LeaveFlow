"use server";

import { db } from "@repo/db/src/index";
import bcrypt from "bcryptjs";
import { SignUpSchema } from "@/schema";
import * as z from "zod";

const signup = async (values: z.infer<typeof SignUpSchema>) => {
  const validation = SignUpSchema.safeParse(values);
  if (!validation.success) {
    return { error: "Invalid input" };
  }

  const { email, password1, password2, name, role } = validation.data;

  if (password1 !== password2) {
    return { error: "Passwords do not match" };
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email already registered" };
  }

  try {
    const hashedPassword = await bcrypt.hash(password1, 10);

      await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          status: "PENDING", // Will be activated by admin/HOD
          role: role,
        },
      });


    return { success: "Account created successfully. Awaiting approval." };
  } catch (error) {
    console.error("Signup error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return { error: "Email already registered" };
      }
    }

    return {
      error: "Failed to create account. Please try again later.",
    };
  }
};

export default signup;