import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";
import jwt from "jsonwebtoken";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = signInSchema.parse(body);
    const { email, password } = parsedData;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 404 }
      );
    }

    const token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        role: existingUser.role,
      },
      JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      { message: "Login successful", user: existingUser },
      { status: 200 }
    );

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "SERVER_ERROR:[API/AUTH/SIGNIN]" },
      { status: 500 }
    );
  }
}
