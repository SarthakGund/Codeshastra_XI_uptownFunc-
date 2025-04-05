import { NextResponse } from "next/server";
import { createOrUpdateUser } from "@/services/userService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Log the incoming request for debugging
    console.log("Received create-user request:", body);
    
    const success = await createOrUpdateUser(body);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to create/update user" }, 
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
