import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Delete all expired and used pending signups
    const result = await prisma.pendingSignup.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } }, // expired
          { used: true }, // used
        ],
      },
    });

    return NextResponse.json({
      message: `Deleted ${result.count} expired pending signups`,
      status: 200,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to cleanup pending signups" },
      { status: 500 }
    );
  }
}
