
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup 
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Config
const firebaseConfig = {
    apiKey: "AIzaSyBbxgCMw5dO5T-kt7Njapo5ST04MRp7JKU",
    authDomain: "ats-friendly-93377.firebaseapp.com",
    projectId: "ats-friendly-93377",
    storageBucket: "ats-friendly-93377.appspot.com",
    messagingSenderId: "542738169697",
    appId: "1:542738169697:web:a999680a273fdd90ab4f20",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const CV_COLLECTION = 'cv-data';

// --- Authentication ---

const handleEmailAuth = (isLogin: boolean, email: string, password: string) => {
    if (isLogin) {
        return signInWithEmailAndPassword(auth, email, password);
    } else {
        return createUserWithEmailAndPassword(auth, email, password);
    }
};

const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
};

const logout = () => {
    return signOut(auth);
};


// --- Firestore Database ---

const saveCvDocument = async (userId: string, data: any) => {
    try {
        const docRef = doc(db, CV_COLLECTION, userId);
        await setDoc(docRef, data, { merge: true });
    } catch (error) {
        console.error("Error saving document: ", error);
    }
};

const getCvDocument = async (userId: string) => {
    try {
        const docRef = doc(db, CV_COLLECTION, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        return null;
    }
};

// Expose to window for other components
(window as any).FirebaseService = {
    auth,
    handleEmailAuth,
    loginWithGoogle,
    logout,
    saveCvDocument,
    getCvDocument
};
