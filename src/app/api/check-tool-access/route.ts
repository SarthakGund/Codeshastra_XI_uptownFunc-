import { NextResponse } from "next/server";
import { canUseTools } from "@/services/userService";
import { currentUser } from "@clerk/nextjs/server";
import { getUser } from "@/services/userService";

export async function GET() {
  try {
    // Get the authenticated user
    const user = await currentUser();
    
    if (!user) {
      // Handle anonymous users - they get 3 uses tracked in localStorage on client side
      return NextResponse.json({ 
        success: true, 
        isAnonymous: true, 
        message: "Anonymous user - usage tracked in browser" 
      });
    }
    
    // Check if user can use tools
    const userData = await getUser(user.id);
    const isPro = userData?.plan === 'pro';
    const accessCheck = await canUseTools(user.id);
    
    return NextResponse.json({
      success: true,
      allowed: accessCheck.allowed || isPro, // Pro users are always allowed
      remaining: isPro ? null : accessCheck.remaining,
      isAnonymous: false,
      userId: user.id,
      isPro: isPro // Add this to the response
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}