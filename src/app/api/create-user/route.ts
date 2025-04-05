import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { ref, set } from "firebase/database";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, password } = body;

    await set(ref(db, `users/${userId}`), {
      email,
      password,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Firebase error:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
