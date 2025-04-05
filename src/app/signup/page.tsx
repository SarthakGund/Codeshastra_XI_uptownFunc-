"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function CustomSignUpPage() {
  const { user, isLoaded } = useUser();
  const [userCreated, setUserCreated] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user || userCreated) return;

    const createUserInFirebase = async () => {
      try {
        console.log("Attempting to create user in Firebase:", user.id);
        
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
            username: user.username,
            imageUrl: user.imageUrl,
            createdAt: new Date().toISOString()
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          console.error("Failed to save user in Firebase:", error);
        } else {
          console.log("User successfully created in Firebase");
          setUserCreated(true);
        }
      } catch (error) {
        console.error("Error saving user to Firebase:", error);
      }
    };

    createUserInFirebase();
  }, [user, isLoaded, userCreated]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <SignUp />
    </div>
  );
}
