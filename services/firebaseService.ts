// 1. İçe Aktarmalar (DÜZELTİLDİ: Tarayıcı uyumlu CDN linkleri eklendi)
// Tüm modüllerin aynı sürüm (10.7.1) olduğundan emin olduk.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("🔥 Firebase Service initializing...");

// 2. Config (Aynen korundu)
const firebaseConfig = {
    apiKey: "AIzaSyBbxgCMw5dO5T-kt7Njapo5ST04MRp7JKU",
    authDomain: "ats-friendly-93377.firebaseapp.com",
    projectId: "ats-friendly-93377",
    storageBucket: "ats-friendly-93377.appspot.com",
    messagingSenderId: "542738169697",
    appId: "1:542738169697:web:a999680a273fdd90ab4f20",
};

// 3. Başlatma
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const CV_COLLECTION = 'cv-data';

// --- Authentication ---

const handleEmailAuth = (isLogin, email, password) => {
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

const saveCvDocument = async (userId, data) => {
    try {
        const docRef = doc(db, CV_COLLECTION, userId);
        await setDoc(docRef, data, { merge: true });
        console.log("Document successfully written!"); // Başarı logu eklendi
    } catch (error) {
        console.error("Error saving document: ", error);
        throw error; // Hatayı yukarı fırlatalım ki UI haberdar olsun
    }
};

const getCvDocument = async (userId) => {
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
window.FirebaseService = {
    auth,
    handleEmailAuth,
    loginWithGoogle,
    logout,
    saveCvDocument,
    getCvDocument
};

console.log("✅ Firebase Service Loaded");