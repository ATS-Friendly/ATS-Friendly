
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
    font: 'ptserif' 
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
        btn_add_section: "Bölüm Ekle",
        btn_design: "Tasarım Ayarları",
        btn_change_tpl: "Şablonu Değiştir",
        btn_download_pdf: "PDF İndir",
        btn_reset: "Sıfırla / Temizle",
        btn_logout: "Çıkış Yap",
        nav_content: "İÇERİK",
        nav_design: "TASARIM",
        nav_actions: "İŞLEMLER",
        status_connecting: "Bağlanıyor...",
        status_online: "Senkronize",
        status_syncing: "Kaydediliyor...",
        status_offline: "Çevrimdışı",
        cv_label_birth: "Doğum Yeri",
        cv_label_license: "Ehliyet",
        confirm_reset: "DİKKAT: CV içeriğiniz tamamen silinecek ve başlangıç haline dönecektir. Devam etmek istiyor musunuz?",
        toast_reset: "CV başarıyla sıfırlandı.",
        modal_theme_title: "Tasarım Ayarları",
        lbl_color: "Vurgu Rengi",
        lbl_font: "Yazı Tipi",
        btn_save_close: "Kapat",
        // Form Translations
        form_title: "Bilgilerinizi Girin",
        form_desc: "CV'nizi oluşturmak için aşağıdaki alanları doldurun.",
        form_personal: "Kişisel Bilgiler",
        form_profile: "Profil Özeti",
        form_experience: "İş Deneyimi",
        form_education: "Eğitim",
        form_lbl_fullname: "Ad Soyad",
        form_lbl_title: "Unvan",
        form_lbl_email: "E-posta",
        form_lbl_phone: "Telefon",
        form_lbl_address: "Adres",
        btn_add_job: "İş Ekle",
        btn_add_edu: "Okul Ekle",
        btn_generate: "CV OLUŞTUR ✨",
        btn_skip: "Mevcut İçeriği Koru (Atla)",
        lbl_job_title: "Pozisyon Adı",
        lbl_company: "Şirket",
        lbl_date: "Tarih (Örn: 2020 - 2022)",
        lbl_desc: "Açıklama",
        lbl_school: "Okul / Üniversite",
        lbl_degree: "Bölüm / Derece"
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
        btn_add_section: "Add Section",
        btn_design: "Design Settings",
        btn_change_tpl: "Change Template",
        btn_download_pdf: "Download PDF",
        btn_reset: "Reset / Clear",
        btn_logout: "Logout",
        nav_content: "CONTENT",
        nav_design: "DESIGN",
        nav_actions: "ACTIONS",
        status_connecting: "Connecting...",
        status_online: "Synced",
        status_syncing: "Saving...",
        status_offline: "Offline",
        cv_label_birth: "Place of birth",
        cv_label_license: "Driving license",
        confirm_reset: "WARNING: Your CV content will be erased and reset to default. Do you want to continue?",
        toast_reset: "CV successfully reset.",
        modal_theme_title: "Design Settings",
        lbl_color: "Accent Color",
        lbl_font: "Font Family",
        btn_save_close: "Close",
        // Form Translations
        form_title: "Enter Your Details",
        form_desc: "Fill in the fields below to generate your CV.",
        form_personal: "Personal Details",
        form_profile: "Professional Summary",
        form_experience: "Work Experience",
        form_education: "Education",
        form_lbl_fullname: "Full Name",
        form_lbl_title: "Job Title",
        form_lbl_email: "Email",
        form_lbl_phone: "Phone",
        form_lbl_address: "Address",
        btn_add_job: "Add Job",
        btn_add_edu: "Add Education",
        btn_generate: "GENERATE CV ✨",
        btn_skip: "Keep Existing Content (Skip)",
        lbl_job_title: "Job Title",
        lbl_company: "Company",
        lbl_date: "Date (e.g., 2020 - 2022)",
        lbl_desc: "Description",
        lbl_school: "School / University",
        lbl_degree: "Degree / Field"
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

// --- TEMA YÖNETİMİ VE DRAGGABLE MODAL ---
window.openThemeModal = () => {
    const modal = document.getElementById('theme-modal');
    modal.classList.add('active');
    
    // User Friendly Positioning
    if (!modal.style.top || !modal.style.left) {
        modal.style.top = "100px";
        const initialLeft = Math.max(20, window.innerWidth - 360);
        modal.style.left = initialLeft + "px";
    }
    
    initDragElement(modal.querySelector('.modal-content'));
};

window.closeThemeModal = () => {
    document.getElementById('theme-modal').classList.remove('active');
    saveToCloud(); // Modal kapanırken kaydet
};

// Sürükleme Mantığı
function initDragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = elmnt.querySelector(".modal-header");
    
    if (header) {
        header.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.parentElement.style.top = (elmnt.parentElement.offsetTop - pos2) + "px";
        elmnt.parentElement.style.left = (elmnt.parentElement.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

window.applyColor = (color) => {
    currentTheme.color = color;
    document.documentElement.style.setProperty('--cv-accent-color', color);
};

window.applyFont = (fontType) => {
    currentTheme.font = fontType;
    let fontVal = "'PT Serif', serif";
    
    switch(fontType) {
        case 'roboto': fontVal = "'Roboto', sans-serif"; break;
        case 'opensans': fontVal = "'Open Sans', sans-serif"; break;
        case 'montserrat': fontVal = "'Montserrat', sans-serif"; break;
        case 'lato': fontVal = "'Lato', sans-serif"; break;
        case 'raleway': fontVal = "'Raleway', sans-serif"; break;
        case 'playfair': fontVal = "'Playfair Display', serif"; break;
        case 'lora': fontVal = "'Lora', serif"; break;
        case 'merriweather': fontVal = "'Merriweather', serif"; break;
        case 'ptserif': default: fontVal = "'PT Serif', serif"; break;
    }

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
    // CRITICAL FIX: Always show onboarding view first!
    // The user can choose to skip it if they want to keep existing data.
    showView('onboarding-view');
};

window.backToTemplates = () => {
    saveToCloud(); 
    showView('template-view');
};

// --- ONBOARDING FORM LOGIC ---
window.addFormExperience = () => {
    const container = document.getElementById('form-experiences-list');
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    const t = translations[currentLang];
    
    div.innerHTML = `
        <button class="remove-dynamic-btn" onclick="this.parentElement.remove()">×</button>
        <div class="input-grid">
            <div class="input-group">
                <label>${t.lbl_job_title}</label>
                <input type="text" class="form-input job-title" placeholder="Ex: Manager">
            </div>
            <div class="input-group">
                <label>${t.lbl_company}</label>
                <input type="text" class="form-input job-company" placeholder="Ex: Google">
            </div>
            <div class="input-group full-width">
                <label>${t.lbl_date}</label>
                <input type="text" class="form-input job-date" placeholder="Ex: Jan 2020 - Present">
            </div>
            <div class="input-group full-width">
                <label>${t.lbl_desc}</label>
                <textarea class="form-input job-desc" rows="3"></textarea>
            </div>
        </div>
    `;
    container.appendChild(div);
};

window.addFormEducation = () => {
    const container = document.getElementById('form-education-list');
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    const t = translations[currentLang];
    
    div.innerHTML = `
        <button class="remove-dynamic-btn" onclick="this.parentElement.remove()">×</button>
        <div class="input-grid">
            <div class="input-group">
                <label>${t.lbl_school}</label>
                <input type="text" class="form-input edu-school" placeholder="Ex: MIT">
            </div>
            <div class="input-group">
                <label>${t.lbl_degree}</label>
                <input type="text" class="form-input edu-degree" placeholder="Ex: Computer Science">
            </div>
            <div class="input-group full-width">
                <label>${t.lbl_date}</label>
                <input type="text" class="form-input edu-date" placeholder="Ex: 2015 - 2019">
            </div>
        </div>
    `;
    container.appendChild(div);
};

window.skipToEditor = () => {
    const currentContent = document.getElementById('cv-root').innerHTML.trim();
    // Only reset if truly empty
    if (!currentContent) {
        resetAll(true); 
    }
    showView('editor-view');
    saveToCloud();
};

window.generateCVFromForm = () => {
    // 1. Gather Data
    const data = {
        fullname: document.getElementById('inp-fullname').value || "ADINIZ SOYADINIZ",
        title: document.getElementById('inp-title').value || "Unvanınız",
        email: document.getElementById('inp-email').value || "email@ornek.com",
        phone: document.getElementById('inp-phone').value || "0555 123 45 67",
        address: document.getElementById('inp-address').value || "Şehir, Ülke",
        birthplace: document.getElementById('inp-birthplace').value || "İstanbul",
        license: document.getElementById('inp-license').value || "B Sınıfı",
        summary: document.getElementById('inp-summary').value || "Profesyonel özetiniz...",
        experiences: [],
        education: []
    };

    // Gather Experience
    document.querySelectorAll('#form-experiences-list .dynamic-item').forEach(item => {
        data.experiences.push({
            title: item.querySelector('.job-title').value,
            company: item.querySelector('.job-company').value,
            date: item.querySelector('.job-date').value,
            desc: item.querySelector('.job-desc').value
        });
    });

    // Gather Education
    document.querySelectorAll('#form-education-list .dynamic-item').forEach(item => {
        data.education.push({
            school: item.querySelector('.edu-school').value,
            degree: item.querySelector('.edu-degree').value,
            date: item.querySelector('.edu-date').value
        });
    });

    // 2. Generate HTML based on Template
    const isCompact = document.body.classList.contains('tpl-compact');
    let html = "";

    if (isCompact) {
        // COMPACT GENERATION
        let expHTML = data.experiences.map(exp => `
            <div class="section">
                <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">🗑️</button></div>
                <div class="section-header"><span class="section-title" contenteditable="true">${currentLang === 'tr' ? 'İŞ DENEYİMİ' : 'EMPLOYMENT HISTORY'}</span></div>
                <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button>
                    <div class="left-col" contenteditable="true">${exp.date}</div>
                    <div class="right-col"><h3 contenteditable="true">${exp.title}, ${exp.company}</h3><p contenteditable="true">${exp.desc}</p></div>
                </div>
            </div>`).join('');
        
        let eduHTML = data.education.map(edu => `
             <div class="section">
                <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">🗑️</button></div>
                <div class="section-header"><span class="section-title" contenteditable="true">${currentLang === 'tr' ? 'EĞİTİM' : 'EDUCATION'}</span></div>
                <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button>
                    <div class="left-col" contenteditable="true">${edu.date}</div>
                    <div class="right-col"><h3 contenteditable="true">${edu.degree}</h3><p contenteditable="true">${edu.school}</p></div>
                </div>
            </div>`).join('');

        html = `
        <header>
            <h1 contenteditable="true">${data.fullname}</h1>
            <div class="subtitle" contenteditable="true">${data.title}</div>
            <div class="address-line" contenteditable="true">${data.address}</div>
            <div class="contact-row"><span contenteditable="true">${data.phone}</span><span contenteditable="true">${data.email}</span></div>
            <div class="compact-separator"></div>
            <div class="personal-details">
                <div class="detail-item"><span class="lbl" contenteditable="true" data-cv-label="birth">${translations[currentLang].cv_label_birth}</span><span class="dots"></span><span class="val" contenteditable="true">${data.birthplace}</span></div>
                <div class="detail-item"><span class="lbl" contenteditable="true" data-cv-label="license">${translations[currentLang].cv_label_license}</span><span class="dots"></span><span class="val" contenteditable="true">${data.license}</span></div>
            </div>
        </header>
        <div id="main-content">
             <div class="section">
                <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">🗑️</button></div>
                <div class="section-header"><span class="section-title" contenteditable="true">${currentLang === 'tr' ? 'PROFİL' : 'PROFILE'}</span></div>
                <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button><div class="right-col" contenteditable="true">${data.summary}</div></div>
            </div>
            ${expHTML}
            ${eduHTML}
        </div>`;

    } else {
        // CLASSIC GENERATION
        let expHTML = data.experiences.map(exp => `
            <div class="section">
                <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">🗑️</button></div>
                <div class="section-header"><span class="section-title" contenteditable="true">${currentLang === 'tr' ? 'İŞ DENEYİMİ' : 'EMPLOYMENT HISTORY'}</span></div>
                <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button>
                    <div class="left-col" contenteditable="true">${exp.date}</div>
                    <div class="right-col"><h3 contenteditable="true">${exp.title}, ${exp.company}</h3><p contenteditable="true">${exp.desc}</p></div>
                </div>
            </div>`).join('');
        
        let eduHTML = data.education.map(edu => `
             <div class="section">
                <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">🗑️</button></div>
                <div class="section-header"><span class="section-title" contenteditable="true">${currentLang === 'tr' ? 'EĞİTİM' : 'EDUCATION'}</span></div>
                <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button>
                    <div class="left-col" contenteditable="true">${edu.date}</div>
                    <div class="right-col"><h3 contenteditable="true">${edu.degree}</h3><p contenteditable="true">${edu.school}</p></div>
                </div>
            </div>`).join('');

        html = `
        <header>
            <h1 contenteditable="true">${data.fullname}</h1>
            <div class="subtitle" contenteditable="true">${data.title}</div>
            <div class="contact-info" contenteditable="true">
                <span>📍 ${data.address}</span> | <span>📞 ${data.phone}</span> | <span>✉️ ${data.email}</span>
            </div>
            <!-- Hidden Fields for Compact switch compatibility -->
            <div class="address-line" style="display:none" contenteditable="true">${data.address}</div>
            <div class="contact-row" style="display:none"><span contenteditable="true">${data.phone}</span><span contenteditable="true">${data.email}</span></div>
            <div class="personal-details" style="display:none">
                 <div class="detail-item"><span class="lbl" contenteditable="true" data-cv-label="birth">${translations[currentLang].cv_label_birth}</span><span class="dots"></span><span class="val" contenteditable="true">${data.birthplace}</span></div>
                <div class="detail-item"><span class="lbl" contenteditable="true" data-cv-label="license">${translations[currentLang].cv_label_license}</span><span class="dots"></span><span class="val" contenteditable="true">${data.license}</span></div>
            </div>
        </header>
        <div id="main-content">
             <div class="section">
                <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">🗑️</button></div>
                <div class="section-header"><span class="section-title" contenteditable="true">${currentLang === 'tr' ? 'PROFİL' : 'PROFILE'}</span></div>
                <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button><div class="right-col" contenteditable="true">${data.summary}</div></div>
            </div>
            ${expHTML}
            ${eduHTML}
        </div>`;
    }

    // 3. Inject & Switch
    document.getElementById('cv-root').innerHTML = html;
    saveToCloud();
    showView('editor-view');
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

// --- RESET FONKSİYONU ---
window.resetAll = async (skipConfirm = false) => {
    if(!skipConfirm && !confirm(translations[currentLang].confirm_reset)) return;

    let content = "";
    
    // Varsayılan İçerik (Default Content)
    if (currentLang === 'tr') {
        content = `
        <header>
            <h1 contenteditable="true">ADINIZ SOYADINIZ</h1>
            <div class="subtitle" contenteditable="true">Unvanınız</div>
            
            <!-- CLASSIC MODE ONLY -->
            <div class="contact-info" contenteditable="true">
                <span>📍 Şehir, Ülke</span> | <span>📞 Telefon</span> | <span>✉️ E-posta</span>
            </div>

            <!-- COMPACT MODE ONLY -->
            <div class="address-line" contenteditable="true">Açık Adresiniz, Şehir, Ülke</div>
            
            <div class="contact-row">
                <span contenteditable="true">555 123 45 67</span>
                <span contenteditable="true">email@ornek.com</span>
            </div>

            <div class="compact-separator"></div>

            <div class="personal-details">
                <div class="detail-item">
                    <span class="lbl" contenteditable="true" data-cv-label="birth">Doğum Yeri</span>
                    <span class="dots"></span>
                    <span class="val" contenteditable="true">İstanbul</span>
                </div>
                <div class="detail-item">
                    <span class="lbl" contenteditable="true" data-cv-label="license">Ehliyet</span>
                    <span class="dots"></span>
                    <span class="val" contenteditable="true">B Sınıfı</span>
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
                <div class="section-header"><span class="section-title" contenteditable="true">PROFİL</span></div>
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
    } else {
        content = `
        <header>
            <h1 contenteditable="true">YOUR NAME</h1>
            <div class="subtitle" contenteditable="true">Your Title</div>
            
            <div class="contact-info" contenteditable="true">
                <span>📍 City, Country</span> | <span>📞 Phone</span> | <span>✉️ Email</span>
            </div>

            <div class="address-line" contenteditable="true">Full Address, City, Country</div>
            
            <div class="contact-row">
                <span contenteditable="true">555 123 45 67</span>
                <span contenteditable="true">email@example.com</span>
            </div>

            <div class="compact-separator"></div>

            <div class="personal-details">
                <div class="detail-item">
                    <span class="lbl" contenteditable="true" data-cv-label="birth">Place of birth</span>
                    <span class="dots"></span>
                    <span class="val" contenteditable="true">City</span>
                </div>
                <div class="detail-item">
                    <span class="lbl" contenteditable="true" data-cv-label="license">Driving license</span>
                    <span class="dots"></span>
                    <span class="val" contenteditable="true">Type B</span>
                </div>
            </div>
        </header>
        <div id="main-content">
            <div class="section">
                <div class="section-actions">
                    <button class="action-btn" onclick="moveUp(this)" title="Up">▲</button>
                    <button class="action-btn" onclick="moveDown(this)" title="Down">▼</button>
                    <button class="action-btn delete" onclick="removeSection(this)" title="Delete">🗑️</button>
                </div>
                <div class="section-header"><span class="section-title" contenteditable="true">PROFILE</span></div>
                <div class="entry">
                    <button class="btn-delete-item" onclick="removeEntry(this)">×</button>
                    <div class="right-col" contenteditable="true">
                        Write your professional summary here. Mention your experience and goals.
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-actions">
                    <button class="action-btn" onclick="moveUp(this)" title="Up">▲</button>
                    <button class="action-btn" onclick="moveDown(this)" title="Down">▼</button>
                    <button class="action-btn delete" onclick="removeSection(this)" title="Delete">🗑️</button>
                </div>
                <div class="section-header"><span class="section-title" contenteditable="true">EMPLOYMENT HISTORY</span></div>
                <div class="entry">
                    <button class="btn-delete-item" onclick="removeEntry(this)">×</button>
                    <div class="left-col" contenteditable="true">Jan 2019 — May 2021</div>
                    <div class="right-col">
                        <h3 contenteditable="true">Position Title, Company Name</h3>
                        <p contenteditable="true">List your achievements and responsibilities here.</p>
                    </div>
                </div>
            </div>
        </div>`;
    }

    document.getElementById('cv-root').innerHTML = content;
    await saveToCloud();
    if(!skipConfirm) showToast(translations[currentLang].toast_reset);
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
