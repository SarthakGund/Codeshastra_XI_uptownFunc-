"use client";

import { SignIn } from "@clerk/nextjs";

export default function CustomSignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn />
    </div>
  );
}
