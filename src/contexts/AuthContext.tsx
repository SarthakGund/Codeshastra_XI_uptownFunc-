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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);

      try {
        // Check if we have a token
        const token = localStorage.getItem("authToken");

        if (token) {
          // Get user profile with the token
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
        localStorage.removeItem("authToken");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.signIn({ email, password });

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
    setIsLoading(true);
    try {
      await authApi.signOut();
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
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

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
    refreshUserData,
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
