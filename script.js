
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
let currentLang = 'tr';
// Theme Defaults
let currentTheme = {
    color: '#2c3e50',
    font: 'serif' // 'serif' or 'sans'
};

// --- DİL YÖNETİMİ (LOCALIZATION) ---
const translations = {
    tr: {
        auth_title: "Giriş Yap",
        auth_continue: "Devam Et",
        auth_google: "Google ile Giriş",
        auth_toggle_signup: "Hesabın yok mu? Kayıt Ol",
        auth_toggle_login: "Zaten hesabın var mı? Giriş Yap",
        tpl_select_header: "Profesyonel Bir Şablon Seçin",
        tpl_classic: "Klasik",
        tpl_classic_desc: "🏛️ Geleneksel & Akademik",
        tpl_compact: "Kompakt",
        tpl_compact_desc: "📄 Minimal & Tek Sayfa",
        btn_add_section: "+ Bölüm Ekle",
        btn_load_sample: "📄 Örnek CV Yükle",
        btn_design: "🎨 Tasarım",
        btn_change_tpl: "🎨 Şablonu Değiştir",
        btn_download_pdf: "🖨️ PDF İndir",
        btn_reset: "🗑️ Sıfırla",
        btn_logout: "Çıkış Yap",
        status_connecting: "Bağlanıyor...",
        status_online: "Senkronize",
        status_syncing: "Kaydediliyor...",
        status_offline: "Çevrimdışı",
        cv_label_birth: "Doğum Yeri",
        cv_label_license: "Ehliyet",
        confirm_reset: "DİKKAT: CV içeriğiniz tamamen silinecek ve seçili dilde (Türkçe) başlangıç haline dönecektir. Devam etmek istiyor musunuz?",
        confirm_sample: "Mevcut CV içeriği silinip seçili dilde (Türkçe) örnek içerik yüklenecek. Onaylıyor musunuz?",
        toast_reset: "CV başarıyla sıfırlandı.",
        toast_sample: "Örnek CV yüklendi!",
        modal_theme_title: "Tasarım Ayarları",
        lbl_color: "Vurgu Rengi",
        lbl_font: "Yazı Tipi",
        btn_save_close: "Kaydet & Kapat"
    },
    en: {
        auth_title: "Login",
        auth_continue: "Continue",
        auth_google: "Login with Google",
        auth_toggle_signup: "Don't have an account? Sign Up",
        auth_toggle_login: "Already have an account? Login",
        tpl_select_header: "Select a Professional Template",
        tpl_classic: "Classic",
        tpl_classic_desc: "🏛️ Traditional & Academic",
        tpl_compact: "Compact",
        tpl_compact_desc: "📄 Minimal & Single Page",
        btn_add_section: "+ Add Section",
        btn_load_sample: "📄 Load Sample CV",
        btn_design: "🎨 Design",
        btn_change_tpl: "🎨 Change Template",
        btn_download_pdf: "🖨️ Download PDF",
        btn_reset: "🗑️ Reset",
        btn_logout: "Logout",
        status_connecting: "Connecting...",
        status_online: "Synced",
        status_syncing: "Saving...",
        status_offline: "Offline",
        cv_label_birth: "Place of birth",
        cv_label_license: "Driving license",
        confirm_reset: "WARNING: Your CV content will be erased and reset to the default in English. Do you want to continue?",
        confirm_sample: "Current CV content will be replaced with English sample content. Do you confirm?",
        toast_reset: "CV successfully reset.",
        toast_sample: "Sample CV loaded!",
        modal_theme_title: "Design Settings",
        lbl_color: "Accent Color",
        lbl_font: "Font Family",
        btn_save_close: "Save & Close"
    }
};

window.setLanguage = (lang) => {
    currentLang = lang;
    
    // UI Güncelle
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    // Toggle Button Style
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.lang-btn[onclick="setLanguage('${lang}')"]`).classList.add('active');

    // Kompakt Şablon Etiketlerini Güncelle (Eğer DOM'da varsa)
    const birthLbl = document.querySelector('[data-cv-label="birth"]');
    if (birthLbl) birthLbl.innerText = translations[lang].cv_label_birth;
    
    const licenseLbl = document.querySelector('[data-cv-label="license"]');
    if (licenseLbl) licenseLbl.innerText = translations[lang].cv_label_license;

    // Login Toggle Text Güncellemesi
    const authToggle = document.getElementById('auth-toggle-text');
    if (authToggle) {
        authToggle.innerText = isLoginMode ? translations[lang].auth_toggle_signup : translations[lang].auth_toggle_login;
    }
};

// --- EKRAN YÖNETİMİ ---
function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');
}

// --- TEMA YÖNETİMİ ---
window.openThemeModal = () => {
    document.getElementById('theme-modal').classList.add('active');
};

window.closeThemeModal = () => {
    document.getElementById('theme-modal').classList.remove('active');
    saveToCloud(); // Modal kapanırken kaydet
};

window.applyColor = (color) => {
    currentTheme.color = color;
    document.documentElement.style.setProperty('--cv-accent-color', color);
};

window.applyFont = (fontType) => {
    currentTheme.font = fontType;
    const fontVal = fontType === 'serif' ? "'PT Serif', serif" : "'Open Sans', sans-serif";
    document.documentElement.style.setProperty('--font-cv', fontVal);
};

// --- KİMLİK DOĞRULAMA (AUTH) ---

window.loginWithGoogle = async () => {
    try {
        updateStatus('syncing'); 
        await signInWithPopup(auth, googleProvider);
    } catch (e) {
        alert("Google Giriş Hatası: " + e.message);
        updateStatus('error');
    }
};

window.toggleAuthMode = () => {
    isLoginMode = !isLoginMode;
    const t = translations[currentLang];
    document.getElementById('auth-title').innerText = isLoginMode ? t.auth_title : "Kayıt Ol";
    window.setLanguage(currentLang);
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
            const data = snap.data();
            document.getElementById('cv-root').innerHTML = data.html;
            document.body.className = data.template || '';
            
            // Temayı Yükle
            if (data.theme) {
                currentTheme = data.theme;
                window.applyColor(currentTheme.color);
                window.applyFont(currentTheme.font);
            }
            
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

window.backToTemplates = () => {
    saveToCloud(); 
    showView('template-view');
};

window.createNewSection = () => {
    const mainContent = document.getElementById('main-content');
    const newSection = document.createElement('div');
    newSection.className = 'section';
    const title = currentLang === 'tr' ? "YENİ BÖLÜM" : "NEW SECTION";
    const date = currentLang === 'tr' ? "Tarih Aralığı" : "Date Range";
    const head = currentLang === 'tr' ? "Başlık" : "Title";
    
    newSection.innerHTML = `
        <div class="section-actions">
            <button class="action-btn" onclick="moveUp(this)" title="Yukarı">▲</button>
            <button class="action-btn" onclick="moveDown(this)" title="Aşağı">▼</button>
            <button class="action-btn delete" onclick="removeSection(this)" title="Sil">🗑️</button>
        </div>
        <div class="section-header"><span class="section-title" contenteditable="true">${title}</span></div>
        <div class="content-list">
            <div class="entry">
                <button class="btn-delete-item" onclick="removeEntry(this)">×</button>
                <div class="left-col" contenteditable="true">${date}</div>
                <div class="right-col"><h3 contenteditable="true">${head}</h3><p contenteditable="true">...</p></div>
            </div>
        </div>
        <div class="add-item-container"><button class="btn-add-item" onclick="addEntry(this)">+ Ekle</button></div>`;
    mainContent.appendChild(newSection);
    saveToCloud();
};

window.addEntry = (btn) => {
    let container = btn.closest('.section').querySelector('.content-list');
    if (!container) container = btn.closest('.section');

    const date = currentLang === 'tr' ? "Tarih" : "Date";
    const head = currentLang === 'tr' ? "Yeni Başlık" : "New Item";

    const newEntry = document.createElement('div');
    newEntry.className = 'entry';
    newEntry.innerHTML = `
        <button class="btn-delete-item" onclick="removeEntry(this)">×</button>
        <div class="left-col" contenteditable="true">${date}</div>
        <div class="right-col"><h3 contenteditable="true">${head}</h3><p contenteditable="true">...</p></div>`;
    
    container.appendChild(newEntry);
    saveToCloud();
};

window.removeSection = (btn) => { if(confirm("Silmek istediğinize emin misiniz?")) { btn.closest('.section').remove(); saveToCloud(); } };
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
            theme: currentTheme, // Temayı da kaydet
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
    const t = translations[currentLang];
    
    if (state === 'online') {
        dot.classList.add('status-online');
        text.innerText = t.status_online;
    } else if (state === 'syncing') {
        dot.classList.add('status-syncing');
        text.innerText = t.status_syncing;
    } else {
        text.innerText = t.status_offline;
    }
}

// Örnek İçerik Yükleme (Dile Göre)
window.loadATSExample = async () => {
    if(confirm(translations[currentLang].confirm_sample)) {
        let content = "";
        
        if (currentLang === 'tr') {
            content = `
            <header>
                <h1 contenteditable="true">AYŞE YILMAZ</h1>
                <div class="subtitle" contenteditable="true">Kıdemli Yönetici Asistanı</div>
                <div class="contact-info" contenteditable="true"><span>📍 İstanbul, TR</span> | <span>📞 0555 123 4567</span> | <span>✉️ ayse@ornek.com</span></div>
                <div class="address-line" contenteditable="true">Bağdat Caddesi No: 15, Kadıköy, İstanbul</div>
                <div class="contact-row"><span contenteditable="true">0555 123 4567</span><span contenteditable="true">ayse@ornek.com</span></div>
                <div class="compact-separator"></div>
                <div class="personal-details">
                    <div class="detail-item"><span class="lbl" contenteditable="true" data-cv-label="birth">Doğum Yeri</span><span class="dots"></span><span class="val" contenteditable="true">İzmir</span></div>
                    <div class="detail-item"><span class="lbl" contenteditable="true" data-cv-label="license">Ehliyet</span><span class="dots"></span><span class="val" contenteditable="true">B Sınıfı</span></div>
                </div>
            </header>
            <div id="main-content">
                <div class="section">
                    <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">×</button></div>
                    <div class="section-header"><span class="section-title" contenteditable="true">PROFİL</span></div>
                    <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button><div class="right-col" contenteditable="true">Şirket kârlılığını ve sürdürülebilirliğini tehdit eden karmaşık makro sorunlarla başa çıkma konusunda 14 yıldan fazla deneyime sahip, %35'e varan önemli harcama tasarrufları sağlayan yenilikçi çözümler sunan Yönetici Asistanı.</div></div>
                </div>
                <div class="section">
                    <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">×</button></div>
                    <div class="section-header"><span class="section-title" contenteditable="true">İŞ DENEYİMİ</span></div>
                    <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button><div class="left-col" contenteditable="true">Oca 2019 — May 2021</div><div class="right-col"><h3 contenteditable="true">Yönetici Asistanı, ABC Holding</h3><p contenteditable="true">T-System EMR'den Meditech EMR'ye başarılı geçişi destekledi. En iyi klinik uygulamaları yeni EMR işlevleriyle uyumlu hale getirmek için akış süreçlerindeki değişiklikleri yönetti.</p></div></div>
                </div>
                 <div class="section">
                    <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">×</button></div>
                    <div class="section-header"><span class="section-title" contenteditable="true">EĞİTİM</span></div>
                    <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button><div class="left-col" contenteditable="true">2015 - 2019</div><div class="right-col"><h3 contenteditable="true">İşletme Yönetimi Lisans</h3><p contenteditable="true">Boğaziçi Üniversitesi</p></div></div>
                </div>
            </div>`;
        } else {
            // ENGLISH CONTENT (Layney Spencer)
            content = `
            <header>
                <h1 contenteditable="true">LAYNEY SPENCER</h1>
                <div class="subtitle" contenteditable="true">Assistant Director</div>
                <div class="contact-info" contenteditable="true"><span>📍 Los Angeles, CA</span> | <span>📞 386-868-3442</span> | <span>✉️ email@email.com</span></div>
                <div class="address-line" contenteditable="true">1515 Pacific Ave, Los Angeles, CA 90291, United States</div>
                <div class="contact-row"><span contenteditable="true">386-868-3442</span><span contenteditable="true">email@email.com</span></div>
                <div class="compact-separator"></div>
                <div class="personal-details">
                    <div class="detail-item"><span class="lbl" contenteditable="true" data-cv-label="birth">Place of birth</span><span class="dots"></span><span class="val" contenteditable="true">San Antonio</span></div>
                    <div class="detail-item"><span class="lbl" contenteditable="true" data-cv-label="license">Driving license</span><span class="dots"></span><span class="val" contenteditable="true">Full</span></div>
                </div>
            </header>
            <div id="main-content">
                <div class="section">
                    <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">×</button></div>
                    <div class="section-header"><span class="section-title" contenteditable="true">PROFILE</span></div>
                    <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button><div class="right-col" contenteditable="true">Astute Assistant Director with over 14 years of experience dealing with complex macro issues that have threatened the company's profitability and longevity by providing innovative solutions resulting in significant expenditure savings of up to 35%.</div></div>
                </div>
                <div class="section">
                    <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">×</button></div>
                    <div class="section-header"><span class="section-title" contenteditable="true">EMPLOYMENT HISTORY</span></div>
                    <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button><div class="left-col" contenteditable="true">Jan 2019 — May 2021</div><div class="right-col"><h3 contenteditable="true">Assistant Director, John Ward Emergency Facility</h3><p contenteditable="true">Supported the successful transition from T-System EMR to Meditech EMR. Supported changes during the flow processes to align best clinical practices with new EMR functions.</p></div></div>
                </div>
                <div class="section">
                    <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">×</button></div>
                    <div class="section-header"><span class="section-title" contenteditable="true">EDUCATION</span></div>
                    <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button><div class="left-col" contenteditable="true">2021</div><div class="right-col"><h3 contenteditable="true">Doctorate in Strategic Management</h3><p contenteditable="true">Cambridge University</p></div></div>
                </div>
            </div>`;
        }
        
        document.getElementById('cv-root').innerHTML = content;
        await saveToCloud();
        showToast(translations[currentLang].toast_sample);
    }
};

// Sıfırla (Dile Göre)
window.resetAll = async () => {
    if(confirm(translations[currentLang].confirm_reset)) {
        let content = "";
        
        if (currentLang === 'tr') {
            content = `
            <header>
                <h1 contenteditable="true">ADINIZ SOYADINIZ</h1>
                <div class="subtitle" contenteditable="true">Unvanınız</div>
                <div class="contact-info" contenteditable="true"><span>📍 Şehir, Ülke</span> | <span>📞 Telefon</span> | <span>✉️ E-posta</span></div>
                <div class="address-line" contenteditable="true">Adres Bilgisi</div>
                <div class="contact-row"><span contenteditable="true">Telefon</span><span contenteditable="true">E-posta</span></div>
                <div class="compact-separator"></div>
                <div class="personal-details">
                    <div class="detail-item"><span class="lbl" contenteditable="true" data-cv-label="birth">Doğum Yeri</span><span class="dots"></span><span class="val" contenteditable="true">Şehir</span></div>
                    <div class="detail-item"><span class="lbl" contenteditable="true" data-cv-label="license">Ehliyet</span><span class="dots"></span><span class="val" contenteditable="true">Sınıf</span></div>
                </div>
            </header>
            <div id="main-content">
                <div class="section">
                    <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">🗑️</button></div>
                    <div class="section-header"><span class="section-title" contenteditable="true">PROFİL</span></div>
                    <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button><div class="right-col" contenteditable="true">Profesyonel özetinizi buraya yazın.</div></div>
                </div>
                <div class="section">
                    <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">🗑️</button></div>
                    <div class="section-header"><span class="section-title" contenteditable="true">İŞ DENEYİMİ</span></div>
                    <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button><div class="left-col" contenteditable="true">Tarih</div><div class="right-col"><h3 contenteditable="true">Pozisyon, Şirket</h3><p contenteditable="true">Detaylar...</p></div></div>
                </div>
            </div>`;
        } else {
            content = `
            <header>
                <h1 contenteditable="true">YOUR NAME</h1>
                <div class="subtitle" contenteditable="true">Your Title</div>
                <div class="contact-info" contenteditable="true"><span>📍 City, Country</span> | <span>📞 Phone</span> | <span>✉️ Email</span></div>
                <div class="address-line" contenteditable="true">Full Address</div>
                <div class="contact-row"><span contenteditable="true">Phone</span><span contenteditable="true">Email</span></div>
                <div class="compact-separator"></div>
                <div class="personal-details">
                    <div class="detail-item"><span class="lbl" contenteditable="true" data-cv-label="birth">Place of birth</span><span class="dots"></span><span class="val" contenteditable="true">City</span></div>
                    <div class="detail-item"><span class="lbl" contenteditable="true" data-cv-label="license">Driving license</span><span class="dots"></span><span class="val" contenteditable="true">Type</span></div>
                </div>
            </header>
            <div id="main-content">
                <div class="section">
                    <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">🗑️</button></div>
                    <div class="section-header"><span class="section-title" contenteditable="true">PROFILE</span></div>
                    <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button><div class="right-col" contenteditable="true">Your professional summary here.</div></div>
                </div>
                <div class="section">
                    <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">🗑️</button></div>
                    <div class="section-header"><span class="section-title" contenteditable="true">EMPLOYMENT HISTORY</span></div>
                    <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button><div class="left-col" contenteditable="true">Date</div><div class="right-col"><h3 contenteditable="true">Position, Company</h3><p contenteditable="true">Details...</p></div></div>
                </div>
            </div>`;
        }
        
        document.getElementById('cv-root').innerHTML = content;
        await saveToCloud();
        showToast(translations[currentLang].toast_reset);
    }
};

// Otomatik kaydetme tetikleyicisi
let saveTimeout;
document.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveToCloud, 1500);
});

// Toast mesajı
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
