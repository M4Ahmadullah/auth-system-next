import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface TokenData {
  userId: number;
  email: string;
  username: string;
}

export async function getTokenData(): Promise<TokenData | null> {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) return null;

    const decoded = jwtDecode<TokenData>(token);
    return decoded;
  } catch {
    return null;
  }
}
