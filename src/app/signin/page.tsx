"use client";

import { SignIn } from "@clerk/nextjs";

export default function CustomSignInPage() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-black">

      <SignIn />
    </div>
  );
}
