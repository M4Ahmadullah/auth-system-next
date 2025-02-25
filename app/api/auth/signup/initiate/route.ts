import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const initiateSignupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  phoneNumber: z.string().optional(),
  gender: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received signup initiation request:", body);
    const data = initiateSignupSchema.parse(body);

    // Check if email already exists in Users
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Generate new OTP and expiration
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check for existing pending signup
    const existingPending = await prisma.pendingSignup.findUnique({
      where: { email: data.email },
    });

    if (existingPending) {
      // Update existing pending signup with new OTP and data
      await prisma.pendingSignup.update({
        where: { email: data.email },
        data: {
          username: data.username,
          passwordHash: hashedPassword,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          otpCode,
          expiresAt,
          used: false, // Reset used status if it was marked as used
        },
      });
    } else {
      // Create new pending signup
      await prisma.pendingSignup.create({
        data: {
          email: data.email,
          username: data.username,
          passwordHash: hashedPassword,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          otpCode,
          expiresAt,
        },
      });
    }

    // Send email
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: data.email,
      subject: "Verify Your Email",
      html: `
        <h1>Email Verification</h1>
        <p>Your verification code is: <strong>${otpCode}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    return NextResponse.json(
      { message: "Verification code sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signup initiation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to initiate signup" },
      { status: 500 }
    );
  }
}
