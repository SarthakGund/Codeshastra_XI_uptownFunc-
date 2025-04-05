'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function UserHandler() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const handleUserSignIn = async () => {
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
            username: user.username,
            imageUrl: user.imageUrl,
          }),
        });

        if (!res.ok) {
          console.error("Failed to update user in Firestore");
        } else {
          console.log("User successfully updated in Firestore");
        }
      } catch (error) {
        console.error("Error handling user sign-in:", error);
      }
    };

    handleUserSignIn();
  }, [user, isLoaded]);

  // This component doesn't render anything
  return null;
}