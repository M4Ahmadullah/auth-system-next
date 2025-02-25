import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Debug log
    console.log("Processing reset request for email:", email);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("No user found with email:", email);
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    // Generate a random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("Generated reset code:", resetCode);

    // Save the reset code
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        code: resetCode,
        expiresAt,
      },
    });

    // Send email with better error handling
    try {
      const emailResponse = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Password Reset Code",
        html: `
          <h1>Password Reset Code</h1>
          <p>Your password reset code is: <strong>${resetCode}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
        `,
      });

      console.log("Email send response:", emailResponse);

      return NextResponse.json(
        { message: "Reset code sent successfully" },
        { status: 200 }
      );
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Delete the reset code since email failed
      await prisma.passwordReset.delete({
        where: {
          id: (
            await prisma.passwordReset.findFirst({
              where: { userId: user.id, code: resetCode },
            })
          )?.id,
        },
      });

      // Type assertion since we know emailError is from Resend API
      const typedError = emailError as { message?: string };
      throw new Error(
        `Failed to send email: ${typedError.message || "Unknown error"}`
      );
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: (error as Error).message || "Failed to send reset code" },
      { status: 500 }
    );
  }
}
