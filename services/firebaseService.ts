
// FIX: Use module names that match the "imports" in index.html
// DO NOT use https:// URLs here. The browser handles mapping via importmap.
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

console.log("🔥 Firebase Service initializing...");

const firebaseConfig = {
    apiKey: "AIzaSyBbxgCMw5dO5T-kt7Njapo5ST04MRp7JKU",
    authDomain: "ats-friendly-93377.firebaseapp.com",
    projectId: "ats-friendly-93377",
    storageBucket: "ats-friendly-93377.appspot.com",
    messagingSenderId: "542738169697",
    appId: "1:542738169697:web:a999680a273fdd90ab4f20",
};

let app;
let auth;
let db;
let googleProvider;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    console.log("✅ Firebase Service Modules Loaded");
} catch (e) {
    console.error("❌ Firebase Initialization Error:", e);
    throw e;
}

const CV_COLLECTION = 'cv-data';

// --- Authentication ---

const handleEmailAuth = async (isLogin: boolean, email: string, password: string) => {
    try {
        if (isLogin) {
            return await signInWithEmailAndPassword(auth, email, password);
        } else {
            return await createUserWithEmailAndPassword(auth, email, password);
        }
    } catch (error) {
        console.error("Auth Error:", error);
        throw error;
    }
};

const loginWithGoogle = async () => {
    try {
        return await signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error("Google Auth Error:", error);
        throw error;
    }
};

const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error);
    }
};


// --- Firestore Database ---

const saveCvDocument = async (userId: string, data: any) => {
    try {
        const docRef = doc(db, CV_COLLECTION, userId);
        await setDoc(docRef, data, { merge: true });
        console.log("💾 Document saved successfully");
    } catch (error) {
        console.error("❌ Error saving document: ", error);
        throw error;
    }
};

const getCvDocument = async (userId: string) => {
    try {
        const docRef = doc(db, CV_COLLECTION, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("ℹ️ No existing document found, returning null");
            return null;
        }
    } catch (error) {
        console.error("❌ Error getting document:", error);
        return null;
    }
};

// Expose to window for other components
// We attach 'auth' directly so onAuthStateChanged can be used in App.tsx
window.FirebaseService = {
    auth,
    handleEmailAuth,
    loginWithGoogle,
    logout,
    saveCvDocument,
    getCvDocument
};
