
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
import { GoogleGenAI, Type } from "@google/genai";

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

// Not: AI servisi artık sayfa yüklendiğinde değil, ihtiyaç duyulduğunda başlatılacak.

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
        btn_add_section: "+ Bölüm Ekle",
        btn_load_sample: "📄 Örnek CV Yükle",
        btn_design: "🎨 Tasarım",
        btn_change_tpl: "🎨 Şablonu Değiştir",
        btn_download_pdf: "🖨️ PDF İndir",
        btn_reset: "🗑️ Sıfırla",
        btn_logout: "Çıkış Yap",
        btn_ai_upload: "AI ile Yükle",
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
        btn_save_close: "Kapat",
        ai_analyzing: "CV'niz Analiz Ediliyor...",
        ai_desc: "Yapay zeka verilerinizi ayıklayıp yerleştiriyor.",
        ai_success: "CV'niz başarıyla dönüştürüldü!",
        ai_error: "CV okunamadı. Dosya formatı bozuk veya içerik algılanamadı."
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
        btn_ai_upload: "Upload with AI",
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
        btn_save_close: "Close",
        ai_analyzing: "Analyzing Your CV...",
        ai_desc: "AI is extracting and formatting your data.",
        ai_success: "CV successfully converted!",
        ai_error: "Could not read CV. File format is corrupt or content unreadable."
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
    
    // User Friendly Positioning:
    // İlk açılışta CV'nin üzerine gelmemesi için sağ tarafa konumlandırıyoruz.
    if (!modal.style.top || !modal.style.left) {
        modal.style.top = "100px";
        // Ekran genişliğine göre sağ kenara yakın bir konum belirle
        // Modal genişliği (css'de 320px) + biraz boşluk
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

// --- AI UPLOAD FUNCTIONALITY ---
window.triggerFileUpload = () => {
    document.getElementById('cv-upload').click();
};

window.handleFileUpload = async (input) => {
    if (input.files.length === 0) return;
    const file = input.files[0];
    
    // Show Loading
    document.getElementById('ai-loading').classList.add('active');

    const reader = new FileReader();
    reader.onload = async function(e) {
        const base64Data = e.target.result.split(',')[1];
        const mimeType = file.type;

        try {
            await analyzeCVWithGemini(base64Data, mimeType);
        } catch (error) {
            console.error("AI Error:", error);
            alert(translations[currentLang].ai_error);
        } finally {
            document.getElementById('ai-loading').classList.remove('active');
        }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again if needed
    input.value = '';
};

async function analyzeCVWithGemini(base64Data, mimeType) {
    // Initialize AI client with current API KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Strict Schema Definition using @google/genai Type
    const cvSchema = {
        type: Type.OBJECT,
        properties: {
            fullName: { type: Type.STRING, description: "The full name of the candidate." },
            title: { type: Type.STRING, description: "Professional title or current role." },
            contact: {
                type: Type.OBJECT,
                properties: {
                    location: { type: Type.STRING },
                    phone: { type: Type.STRING },
                    email: { type: Type.STRING },
                    fullAddress: { type: Type.STRING }
                }
            },
            personal: {
                type: Type.OBJECT,
                properties: {
                    birthPlace: { type: Type.STRING },
                    license: { type: Type.STRING }
                }
            },
            profile: { type: Type.STRING, description: "Professional summary or bio." },
            experience: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING },
                        title: { type: Type.STRING },
                        company: { type: Type.STRING },
                        description: { type: Type.STRING }
                    }
                }
            },
            education: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING },
                        degree: { type: Type.STRING },
                        school: { type: Type.STRING }
                    }
                }
            },
            certifications: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        provider: { type: Type.STRING }
                    }
                }
            }
        },
        required: ["fullName", "contact", "experience", "education"]
    };

    const prompt = `Extract data from this CV document (PDF/Image).
    The text might contain mixed languages (e.g., Turkish header, English content). 
    Extract the content exactly as written, but map it to the correct schema fields.
    - If the name is in capital letters (e.g. HÜSEYİN YAŞAR), extract it as Full Name.
    - If you see "Human Resources Specialist Assistant" or similar roles, map them to Experience or Title.
    - Fix any obvious OCR errors (typos) in the extraction.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: {
            parts: [
                { inlineData: { mimeType: mimeType, data: base64Data } },
                { text: prompt }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: cvSchema
        }
    });

    // With responseSchema, response.text is guaranteed to be valid JSON conforming to the schema.
    const cvData = JSON.parse(response.text);
    
    populateCVFromJSON(cvData);
    showToast(translations[currentLang].ai_success);
}

function populateCVFromJSON(data) {
    // Generate HTML String based on extracted JSON
    
    // Map experience to HTML
    const expHTML = data.experience && data.experience.length > 0 ? data.experience.map(exp => `
        <div class="section">
            <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">×</button></div>
            <div class="section-header"><span class="section-title" contenteditable="true">${currentLang === 'tr' ? 'İŞ DENEYİMİ' : 'EMPLOYMENT HISTORY'}</span></div>
            <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button><div class="left-col" contenteditable="true">${exp.date || ''}</div><div class="right-col"><h3 contenteditable="true">${exp.title || ''}, ${exp.company || ''}</h3><p contenteditable="true">${exp.description || ''}</p></div></div>
        </div>
    `).join('') : '';

    // Map education to HTML
    const eduHTML = data.education && data.education.length > 0 ? data.education.map(edu => `
        <div class="section">
            <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">×</button></div>
            <div class="section-header"><span class="section-title" contenteditable="true">${currentLang === 'tr' ? 'EĞİTİM' : 'EDUCATION'}</span></div>
            <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button><div class="left-col" contenteditable="true">${edu.date || ''}</div><div class="right-col"><h3 contenteditable="true">${edu.degree || ''}</h3><p contenteditable="true">${edu.school || ''}</p></div></div>
        </div>
    `).join('') : '';

    // Map certifications to HTML (Added support)
    const certHTML = data.certifications && data.certifications.length > 0 ? `
        <div class="section">
            <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">×</button></div>
            <div class="section-header"><span class="section-title" contenteditable="true">${currentLang === 'tr' ? 'SERTİFİKALAR' : 'CERTIFICATIONS'}</span></div>
            ${data.certifications.map(cert => `
                <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button><div class="left-col" contenteditable="true"></div><div class="right-col"><h3 contenteditable="true">${cert.name}</h3><p contenteditable="true">${cert.provider || ''}</p></div></div>
            `).join('')}
        </div>
    ` : '';

    // Combine Profile
    const profileHTML = data.profile ? `
        <div class="section">
            <div class="section-actions"><button class="action-btn" onclick="moveUp(this)">▲</button><button class="action-btn" onclick="moveDown(this)">▼</button><button class="action-btn delete" onclick="removeSection(this)">×</button></div>
            <div class="section-header"><span class="section-title" contenteditable="true">${currentLang === 'tr' ? 'PROFİL' : 'PROFILE'}</span></div>
            <div class="entry"><button class="btn-delete-item" onclick="removeEntry(this)">×</button><div class="right-col" contenteditable="true">${data.profile}</div></div>
        </div>
    ` : '';

    // Safely handle potentially missing nested objects
    const contact = data.contact || {};
    const personal = data.personal || {};

    const newContent = `
    <header>
        <h1 contenteditable="true">${data.fullName || 'ADINIZ SOYADINIZ'}</h1>
        <div class="subtitle" contenteditable="true">${data.title || ''}</div>
        <div class="contact-info" contenteditable="true"><span>📍 ${contact.location || ''}</span> | <span>📞 ${contact.phone || ''}</span> | <span>✉️ ${contact.email || ''}</span></div>
        <div class="address-line" contenteditable="true">${contact.fullAddress || contact.location || ''}</div>
        <div class="contact-row"><span contenteditable="true">${contact.phone || ''}</span><span contenteditable="true">${contact.email || ''}</span></div>
        <div class="compact-separator"></div>
        <div class="personal-details">
            <div class="detail-item"><span class="lbl" contenteditable="true" data-cv-label="birth">${translations[currentLang].cv_label_birth}</span><span class="dots"></span><span class="val" contenteditable="true">${personal.birthPlace || ''}</span></div>
            <div class="detail-item"><span class="lbl" contenteditable="true" data-cv-label="license">${translations[currentLang].cv_label_license}</span><span class="dots"></span><span class="val" contenteditable="true">${personal.license || ''}</span></div>
        </div>
    </header>
    <div id="main-content">
        ${profileHTML}
        ${expHTML}
        ${eduHTML}
        ${certHTML}
    </div>`;

    document.getElementById('cv-root').innerHTML = newContent;
    saveToCloud();
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
