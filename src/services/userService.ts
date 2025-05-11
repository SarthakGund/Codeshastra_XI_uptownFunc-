import { db } from "@/lib/firebase";
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp, 
  updateDoc,
  increment 
} from "firebase/firestore";

interface UserData {
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  imageUrl?: string | null;
  plan?: string;
  toolUsage?: number; // Track number of tool usages
}

/**
 * Creates or updates a user in Firestore
 */
export async function createOrUpdateUser(userData: UserData): Promise<boolean> {
  try {
    const { userId, email } = userData;
    
    if (!userId || !email) {
      console.error("Missing required user data");
      return false;
    }

    // Check if user exists
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        ...userData
      });
      console.log("User updated in Firestore:", userId);
    } else {
      // Create new user with free plan by default and 0 tool usage
      await setDoc(userRef, {
        email,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        username: userData.username || null,
        imageUrl: userData.imageUrl || null,
        createdAt: new Date().toISOString(),
        lastLogin: serverTimestamp(),
        authProvider: "clerk",
        plan: "free", // Default plan to free
        toolUsage: 0   // Initialize tool usage counter
      });
      console.log("New user created in Firestore:", userId);
    }
    
    return true;
  } catch (error) {
    console.error("Error in createOrUpdateUser:", error);
    return false;
  }
}

/**
 * Increments the tool usage count for a user
 */
export async function incrementToolUsage(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      toolUsage: increment(1)
    });
    return true;
  } catch (error) {
    console.error("Error incrementing tool usage:", error);
    return false;
  }
}

/**
 * Checks if a user can use tools based on their plan and usage count
 */
export async function canUseTools(userId: string): Promise<{allowed: boolean; remaining?: number}> {
  try {
    const userData = await getUser(userId);
    
    if (!userData) {
      return { allowed: false, remaining: 0 };
    }

    // Pro users have unlimited access - make this check more robust
    if (userData.plan === 'pro') {
      return { allowed: true };
    }

    // Free users have limited access (3 uses)
    const usageCount = userData.toolUsage || 0;
    const maxUsage = 3;
    const remaining = Math.max(0, maxUsage - usageCount);
    
    return { 
      allowed: remaining > 0,
      remaining 
    };
  } catch (error) {
    console.error("Error checking tool usage:", error);
    return { allowed: false, remaining: 0 };
  }
}

/**
 * Upgrades a user's plan to pro
 */
export async function upgradeUserToPro(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      plan: "pro",
      upgradedAt: serverTimestamp()
    });
    console.log("User upgraded to pro plan:", userId);
    return true;
  } catch (error) {
    console.error("Error upgrading user plan:", error);
    return false;
  }
}

/**
 * Retrieves a user from Firestore
 */
export async function getUser(userId: string): Promise<{id: string; plan?: string; toolUsage?: number} | null> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as {id: string; plan?: string; toolUsage?: number};
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}