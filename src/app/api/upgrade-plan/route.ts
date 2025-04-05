import { NextResponse } from "next/server";
import { upgradeUserToPro } from "@/services/userService";
import { currentUser } from "@clerk/nextjs/server";

export async function POST() {
  try {
    // Get the authenticated user
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }
    
    // Upgrade the user's plan
    const success = await upgradeUserToPro(user.id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to upgrade plan" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}