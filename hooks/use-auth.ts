import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

interface DecodedToken {
  userId: number;
  email: string;
  username: string;
  role: "ADMIN" | "USER";
  iat: number;
  exp: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface User {
  id: number;
  email: string;
  username: string;
  role: "ADMIN" | "USER";
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{
    id: number;
    email: string;
    username: string;
    role: "ADMIN" | "USER";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = () => {
    try {
      const token = Cookies.get("token");

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp > currentTime) {
          setIsAuthenticated(true);
          setUser({
            id: decoded.userId,
            email: decoded.email,
            username: decoded.username,
            role: decoded.role,
          });
        } else {
          Cookies.remove("token");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (decodeError) {
        console.error("Token decode error:", decodeError);
        Cookies.remove("token");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    const interval = setInterval(checkAuth, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return {
    isAuthenticated,
    user,
    isLoading,
    refreshAuth: checkAuth,
  };
}
