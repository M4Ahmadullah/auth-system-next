import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.json({ message: "Logout successful" });

  res.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return res;
}
