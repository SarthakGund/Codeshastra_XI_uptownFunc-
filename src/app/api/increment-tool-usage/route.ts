import { NextResponse } from "next/server";
import { incrementToolUsage } from "@/services/userService";
import { currentUser } from "@clerk/nextjs/server";


export async function POST() {
  try {
    const user = await currentUser();
    
    console.log("API: increment-tool-usage called for user:", user?.id || "anonymous");
    
    if (!user) {
      // For anonymous users, we'll handle this on the client side with localStorage
      return NextResponse.json({ 
        success: true,
        isAnonymous: true
      });
    }
    
    // Increment the usage count
    const success = await incrementToolUsage(user.id);
    console.log("Increment result:", success);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to increment tool usage" },
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