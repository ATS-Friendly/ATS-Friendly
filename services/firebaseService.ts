
console.log("🛠️ Mock Service initializing (Frontend Only Mode)...");

// --- Mock State ---
const LOCAL_STORAGE_USER_KEY = 'ats_mock_user';
const LOCAL_STORAGE_DATA_KEY = 'ats_mock_data';

// Observers for onAuthStateChanged
const authObservers: Function[] = [];

// Helper to get current user
const getMockUser = () => {
    const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    return stored ? JSON.parse(stored) : null;
};

// --- Mock Auth Methods ---

const auth = {
    currentUser: getMockUser()
};

const notifyObservers = (user: any) => {
    auth.currentUser = user;
    authObservers.forEach(cb => cb(user));
};

const onAuthStateChanged = (authInstance: any, callback: Function) => {
    authObservers.push(callback);
    // Immediately call with current state
    callback(getMockUser());
    // Return unsubscribe function
    return () => {
        const index = authObservers.indexOf(callback);
        if (index > -1) authObservers.splice(index, 1);
    };
};

const handleEmailAuth = async (isLogin: boolean, email: string, password: string) => {
    console.log(`[MockAuth] ${isLogin ? 'Login' : 'Register'} with ${email}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Create a fake user object
    const user = {
        uid: 'mock-user-' + Math.random().toString(36).substr(2, 9),
        email: email,
        displayName: email.split('@')[0]
    };

    // "Login" the user
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    notifyObservers(user);
    
    return user;
};

const loginWithGoogle = async () => {
    console.log("[MockAuth] Google Login");
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = {
        uid: 'mock-google-user-123',
        email: 'google-user@example.com',
        displayName: 'Google User'
    };
    
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    notifyObservers(user);
    return user;
};

const logout = async () => {
    console.log("[MockAuth] Logout");
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    notifyObservers(null);
};


// --- Mock Database (LocalStorage) ---

const saveCvDocument = async (userId: string, data: any) => {
    console.log(`[MockDB] Saving data for ${userId}`, data);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Store in a dictionary by User ID
    const allData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DATA_KEY) || '{}');
    allData[userId] = data;
    localStorage.setItem(LOCAL_STORAGE_DATA_KEY, JSON.stringify(allData));
};

const getCvDocument = async (userId: string) => {
    console.log(`[MockDB] Fetching data for ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 300));

    const allData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DATA_KEY) || '{}');
    return allData[userId] || null;
};

// Expose the Mock Service
window.FirebaseService = {
    auth, // Mock object
    onAuthStateChanged, // Mock implementation
    handleEmailAuth,
    loginWithGoogle,
    logout,
    saveCvDocument,
    getCvDocument
};

console.log("✅ Mock Service Ready. Using LocalStorage.");
