"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/utils/api";

interface User {
  uid: string;
  email: string;
  plan: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ token: string; uid: string; email: string; plan?: string; isOtpRequired?: boolean }>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUserData: () => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  isOtpRequired: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isOtpRequired, setIsOtpRequired] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (token) {
          const userData = await authApi.getUserProfile();

          setUser({
            uid: userData.uid,
            email: userData.email,
            plan: userData.plan || "free",
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("authToken"); // Clear invalid token
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.signIn({ email, password });
      localStorage.setItem("authToken", response.token); // Store token in localStorage
      setUser({
        uid: response.uid,
        email: response.email,
        plan: response.plan || "free",
      });
      setIsAuthenticated(true);
      return response; // Return the response to include isOtpRequired
    } catch (error) {
      console.error("Sign-in failed:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.signUp({ email, password });

      setUser({
        uid: response.uid,
        email: response.email,
        plan: response.plan,
      });
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authApi.signOut();
    } catch (error) {
      console.warn("Sign-out failed, but clearing local data:", error);
    } finally {
      localStorage.removeItem("authToken"); // Clear token from localStorage
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      router.push("/");
    }
  };

  const refreshUserData = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const userData = await authApi.getUserProfile();

      setUser({
        uid: userData.uid,
        email: userData.email,
        plan: userData.plan || "free",
      });
    } catch (error) {
      console.error("Failed to refresh user data", error);

      if (
        error instanceof Error &&
        error.message.includes("Authentication failed")
      ) {
        // Handle expired token
        setUser(null);
        setIsAuthenticated(false);
        router.push("/signin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const response = await authApi.verifyOtp(email, otp, "signup");
      if (response.success) {
        setIsAuthenticated(true);
        await refreshUserData();
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
    refreshUserData,
    verifyOtp,
    isOtpRequired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
