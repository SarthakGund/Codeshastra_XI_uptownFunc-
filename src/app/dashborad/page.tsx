"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
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
            firstName: user.firstName,
            lastName: user.lastName,
          }),
        });

        if (!res.ok) {
          console.error("Failed to create user in Firebase");
        } else {
          console.log("User successfully added to Firebase");
        }
      } catch (error) {
        console.error("Error creating user in Firebase:", error);
      }
    };

    createUserInFirebase();
  }, [user]);

  return (
    <div>
      Welcome, {user?.primaryEmailAddress?.emailAddress}!
    </div>
  );
}

