"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function CustomSignUpPage() {
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const createUserInFirebase = async () => {
      try {
        const res = await fetch("/api/create-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            // firstName: user.firstName,
            // lastName: user.lastName,
          }),
        });

        if (!res.ok) {
          console.error("Failed to save user in Firebase");
        }
      } catch (error) {
        console.error("Error saving user:", error);
      }
    };

    createUserInFirebase();
  }, [user]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp />
    </div>
  );
}
