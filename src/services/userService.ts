import { db } from "@/lib/firebase";
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp, 
  updateDoc 
} from "firebase/firestore";

interface UserData {
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  imageUrl?: string | null;
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
      // Create new user
      await setDoc(userRef, {
        email,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        username: userData.username || null,
        imageUrl: userData.imageUrl || null,
        createdAt: new Date().toISOString(),
        lastLogin: serverTimestamp(),
        authProvider: "clerk"
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
 * Retrieves a user from Firestore
 */
export async function getUser(userId: string) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}