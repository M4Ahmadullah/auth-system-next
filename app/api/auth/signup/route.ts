import { NextRequest, NextResponse } from "next/server";
// import bcrypt from "bcryptjs"; // Commented out hashing import
import prisma from "@/lib/prisma";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(8),
  phoneNumber: z.string().optional(),
  gender: z.string().optional(),
});

export async function GET() {
  return NextResponse.json({ message: "Hello from the API!" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = signUpSchema.parse(body);
    const { email, username, password, phoneNumber, gender } = parsedData;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Store original password instead of hashing
    // const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: password, // Storing plain password
        phoneNumber,
        gender,
      },
    });

    return NextResponse.json({
      message: "User Created:",
      user: newUser,
      status: 201,
    });
  } catch {
    return NextResponse.json(
      { error: "SERVER_ERROR:[API/AUTH/SIGNUP]" },
      { status: 500 }
    );
  }
}
