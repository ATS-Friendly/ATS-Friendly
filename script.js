
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- FIREBASE YAPILANDIRMASI ---
const firebaseConfig = {
    apiKey: "AIzaSyBbxgCMw5dO5T-kt7Njapo5ST04MRp7JKU",
    authDomain: "ats-friendly-93377.firebaseapp.com",
    projectId: "ats-friendly-93377",
    storageBucket: "ats-friendly-93377.firebasestorage.app",
    messagingSenderId: "542738169697",
    appId: "1:542738169697:web:a999680a273fdd90ab4f20",
    measurementId: "G-MCW4JWYYN4"
};

// Uygulamayı Başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const appId = "mono-cv-app";

let isLoginMode = true;
let currentUser = null;
let isSyncing = false;

// --- EKRAN YÖNETİMİ ---
function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');
}

// --- KİMLİK DOĞRULAMA (AUTH) ---

// Google ile Giriş Yapma Fonksiyonu
window.loginWithGoogle = async () => {
    try {
        updateStatus('syncing'); // Bağlanıyor durumunu göster
        await signInWithPopup(auth, googleProvider);
        // onAuthStateChanged otomatik olarak tetiklenecek
    } catch (e) {
        alert("Google Giriş Hatası: " + e.message);
        updateStatus('error');
    }
};

window.toggleAuthMode = () => {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'Login' : 'Sign Up';
    document.getElementById('auth-toggle-text').innerText = isLoginMode ? "Don't have an account? Sign Up" : 'Already have an account? Login';
};

window.handleAuth = async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    if (!email || !password) return alert("Please fill in all fields.");

    try {
        if (isLoginMode) await signInWithEmailAndPassword(auth, email, password);
        else await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) { 
        alert("Error: " + e.message); 
    }
};

window.logout = () => signOut(auth).then(() => {
    localStorage.removeItem('monoCvData_v2');
    location.reload();
});

// Kullanıcı durumu değişikliğini izle
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'cvContent');
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
            document.getElementById('cv-root').innerHTML = snap.data().html;
            document.body.className = snap.data().template || '';
            showView('editor-view');
            updateStatus('online');
        } else {
            showView('template-view');
        }
    } else {
        showView('auth-view');
    }
});

// --- ŞABLON VE EDİTÖR MANTIĞI ---
window.selectTemplate = (tpl) => {
    document.body.className = tpl;
    showView('editor-view');
    saveToCloud(); 
};

// YENİ: Şablon Değiştirme Fonksiyonu
window.backToTemplates = () => {
    saveToCloud(); // Değişiklikleri kaydet
    showView('template-view'); // Şablon ekranına dön
};

window.createNewSection = () => {
    const mainContent = document.getElementById('main-content');
    const newSection = document.createElement('div');
    newSection.className = 'section';
    newSection.innerHTML = `
        <div class="section-actions">
            <button class="action-btn" onclick="moveUp(this)" title="Yukarı">▲</button>
            <button class="action-btn" onclick="moveDown(this)" title="Aşağı">▼</button>
            <button class="action-btn delete" onclick="removeSection(this)" title="Sil">🗑️</button>
        </div>
        <div class="section-header"><span class="section-title" contenteditable="true">YENİ BÖLÜM</span></div>
        <div class="content-list">
            <div class="entry">
                <button class="btn-delete-item" onclick="removeEntry(this)">×</button>
                <div class="left-col" contenteditable="true">Tarih Aralığı</div>
                <div class="right-col"><h3 contenteditable="true">Başlık</h3><p contenteditable="true">Detaylar...</p></div>
            </div>
        </div>
        <div class="add-item-container"><button class="btn-add-item" onclick="addEntry(this)">+ Ekle</button></div>`;
    mainContent.appendChild(newSection);
    saveToCloud();
};

window.addEntry = (btn) => {
    // Butonun yerini doğru bulmak için yapıyı kontrol et
    let container = btn.closest('.section').querySelector('.content-list');
    
    // Eğer eski yapıdan kalma ise ve content-list yoksa direkt section'a ekle (Geriye dönük uyumluluk)
    if (!container) {
        container = btn.closest('.section');
    }

    const newEntry = document.createElement('div');
    newEntry.className = 'entry';
    newEntry.innerHTML = `
        <button class="btn-delete-item" onclick="removeEntry(this)">×</button>
        <div class="left-col" contenteditable="true">Tarih Aralığı</div>
        <div class="right-col"><h3 contenteditable="true">Yeni Başlık</h3><p contenteditable="true">Detaylar...</p></div>`;
    
    // Add butonundan önce ekle
    container.appendChild(newEntry);
    saveToCloud();
};

window.removeSection = (btn) => { if(confirm("Bu bölümü silmek istediğinize emin misiniz?")) { btn.closest('.section').remove(); saveToCloud(); } };
window.removeEntry = (btn) => { btn.closest('.entry').remove(); saveToCloud(); };
window.moveUp = (btn) => { const s = btn.closest('.section'); if(s.previousElementSibling) { s.parentNode.insertBefore(s, s.previousElementSibling); saveToCloud(); } };
window.moveDown = (btn) => { const s = btn.closest('.section'); if(s.nextElementSibling) { s.parentNode.insertBefore(s.nextElementSibling, s); saveToCloud(); } };

// --- BULUT SENKRONİZASYONU ---
async function saveToCloud() {
    if (!currentUser || isSyncing) return;
    isSyncing = true;
    updateStatus('syncing');
    
    const content = document.getElementById('cv-root').innerHTML;
    const tpl = document.body.className;
    const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'data', 'cvContent');
    
    try {
        await setDoc(docRef, { 
            html: content, 
            template: tpl,
            updatedAt: new Date().toISOString() 
        }, { merge: true });
        updateStatus('online');
    } catch (e) { 
        updateStatus('error'); 
        console.error("Save failed:", e);
    } finally {
        isSyncing = false;
    }
}

function updateStatus(state) {
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    if (!dot || !text) return;

    dot.className = 'status-dot';
    if (state === 'online') {
        dot.classList.add('status-online');
        text.innerText = 'Senkronize';
    } else if (state === 'syncing') {
        dot.classList.add('status-syncing');
        text.innerText = 'Kaydediliyor...';
    } else {
        text.innerText = 'Çevrimdışı';
    }
}

// Örnek İçerik Yükleme Fonksiyonu
window.loadATSExample = async () => {
    if(confirm("Mevcut CV içeriği silinip örnek ATS uyumlu içerik yüklenecek. Onaylıyor musunuz?")) {
        const atsContent = `
        <header>
            <h1 contenteditable="true">LAYNEY SPENCER</h1>
            <div class="subtitle" contenteditable="true">Assistant Director</div>
            
            <!-- CLASSIC MODE ONLY -->
            <div class="contact-info" contenteditable="true">
                <span>📍 Los Angeles, CA</span> | <span>📞 386-868-3442</span> | <span>✉️ email@email.com</span>
            </div>

            <!-- COMPACT MODE ONLY -->
            <div class="address-line" contenteditable="true">1515 Pacific Ave, Los Angeles, CA 90291, United States</div>
            
            <div class="contact-row">
                <span contenteditable="true">386-868-3442</span>
                <span contenteditable="true">email@email.com</span>
            </div>

            <div class="compact-separator"></div>

            <div class="personal-details">
                <div class="detail-item">
                    <span class="lbl">Place of birth</span>
                    <span class="dots"></span>
                    <span class="val" contenteditable="true">San Antonio</span>
                </div>
                <div class="detail-item">
                    <span class="lbl">Driving license</span>
                    <span class="dots"></span>
                    <span class="val" contenteditable="true">Full</span>
                </div>
            </div>
        </header>
        <div id="main-content">
            <div class="section">
                <div class="section-actions">
                    <button class="action-btn" onclick="moveUp(this)" title="Yukarı">▲</button>
                    <button class="action-btn" onclick="moveDown(this)" title="Aşağı">▼</button>
                    <button class="action-btn delete" onclick="removeSection(this)" title="Sil">×</button>
                </div>
                <div class="section-header"><span class="section-title" contenteditable="true">PROFILE</span></div>
                <div class="entry">
                     <button class="btn-delete-item" onclick="removeEntry(this)">×</button>
                    <div class="right-col" contenteditable="true">
                        Astute Assistant Director with over 14 years of experience dealing with complex macro issues that have threatened the company's profitability and longevity by providing innovative solutions resulting in significant expenditure savings of up to 35%. Acted as the advisory to the board of directors and demonstrated expertise in persuading and negotiating shareholder representatives regarding the most appropriate mergers and acquisition strategies.
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-actions">
                    <button class="action-btn" onclick="moveUp(this)" title="Yukarı">▲</button>
                    <button class="action-btn" onclick="moveDown(this)" title="Aşağı">▼</button>
                    <button class="action-btn delete" onclick="removeSection(this)" title="Sil">×</button>
                </div>
                <div class="section-header"><span class="section-title" contenteditable="true">EMPLOYMENT HISTORY</span></div>
                <div class="entry">
                     <button class="btn-delete-item" onclick="removeEntry(this)">×</button>
                    <div class="left-col" contenteditable="true">Jan 2019 — May 2021</div>
                    <div class="right-col">
                        <h3 contenteditable="true">Assistant Director, John Ward Emergency Facility</h3>
                        <p contenteditable="true">Supported the successful transition from T-System EMR to Meditech EMR. Supported changes during the flow processes to align best clinical practices with new EMR functions.</p>
                        <ul style="margin-top:5px; padding-left:15px;" contenteditable="true">
                            <li>Increased operations efficiency in the new Fast Track operations department. Increased FT volume from <17% of total patient volume to >38%.</li>
                            <li>Supported patient satisfaction through frequent patient visits and coaching staff on the way to enhance patient satisfaction.</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-actions">
                    <button class="action-btn" onclick="moveUp(this)" title="Yukarı">▲</button>
                    <button class="action-btn" onclick="moveDown(this)" title="Aşağı">▼</button>
                    <button class="action-btn delete" onclick="removeSection(this)" title="Sil">×</button>
                </div>
                <div class="section-header"><span class="section-title" contenteditable="true">EDUCATION</span></div>
                <div class="entry">
                     <button class="btn-delete-item" onclick="removeEntry(this)">×</button>
                    <div class="left-col" contenteditable="true">2021</div>
                    <div class="right-col">
                        <h3 contenteditable="true">Doctorate in Strategic Management</h3>
                        <p contenteditable="true">Cambridge University</p>
                    </div>
                </div>
            </div>
        </div>`;
        
        document.getElementById('cv-root').innerHTML = atsContent;
        await saveToCloud();
        showToast("Örnek CV yüklendi!");
    }
};

window.resetAll = async () => {
    if(confirm("DİKKAT: CV içeriğiniz tamamen silinecek ve başlangıç haline dönecektir. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?")) {
        const defaultContent = `
        <header>
            <h1 contenteditable="true">ADINIZ SOYADINIZ</h1>
            <div class="subtitle" contenteditable="true">Unvanınız</div>
            
            <!-- CLASSIC ONLY -->
            <div class="contact-info" contenteditable="true">
                <span>📍 Şehir, Ülke</span> | <span>📞 Telefon</span> | <span>✉️ E-posta</span>
            </div>

            <!-- COMPACT ONLY -->
            <div class="address-line" contenteditable="true">1515 Pacific Ave, Los Angeles, CA 90291, United States</div>
            
            <div class="contact-row">
                <span contenteditable="true">3868683442</span>
                <span contenteditable="true">email@email.com</span>
            </div>

            <div class="compact-separator"></div>

            <div class="personal-details">
                <div class="detail-item">
                    <span class="lbl">Place of birth</span>
                    <span class="dots"></span>
                    <span class="val" contenteditable="true">San Antonio</span>
                </div>
                <div class="detail-item">
                    <span class="lbl">Driving license</span>
                    <span class="dots"></span>
                    <span class="val" contenteditable="true">Full</span>
                </div>
            </div>
        </header>
        <div id="main-content">
            <div class="section">
                <div class="section-actions">
                    <button class="action-btn" onclick="moveUp(this)" title="Yukarı">▲</button>
                    <button class="action-btn" onclick="moveDown(this)" title="Aşağı">▼</button>
                    <button class="action-btn delete" onclick="removeSection(this)" title="Sil">🗑️</button>
                </div>
                <div class="section-header"><span class="section-title" contenteditable="true">PROFIL</span></div>
                <div class="entry">
                     <button class="btn-delete-item" onclick="removeEntry(this)">×</button>
                    <div class="right-col" contenteditable="true">
                        Profesyonel özetinizi buraya yazın. Deneyimlerinizden ve hedeflerinizden bahsedin.
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-actions">
                    <button class="action-btn" onclick="moveUp(this)" title="Yukarı">▲</button>
                    <button class="action-btn" onclick="moveDown(this)" title="Aşağı">▼</button>
                    <button class="action-btn delete" onclick="removeSection(this)" title="Sil">🗑️</button>
                </div>
                <div class="section-header"><span class="section-title" contenteditable="true">İŞ DENEYİMİ</span></div>
                <div class="entry">
                     <button class="btn-delete-item" onclick="removeEntry(this)">×</button>
                    <div class="left-col" contenteditable="true">Oca 2019 — May 2021</div>
                    <div class="right-col">
                        <h3 contenteditable="true">Pozisyon Adı, Şirket Adı</h3>
                        <p contenteditable="true">Burada yaptığınız işleri ve başarılarınızı maddeler halinde sıralayabilirsiniz.</p>
                    </div>
                </div>
            </div>
        </div>`;
        
        document.getElementById('cv-root').innerHTML = defaultContent;
        await saveToCloud();
        showToast("CV başarıyla sıfırlandı.");
    }
};

// Otomatik kaydetme tetikleyicisi
let saveTimeout;
document.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveToCloud, 1500);
});

// Toast mesajı gösterme fonksiyonu (Opsiyonel)
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
