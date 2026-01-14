
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
        btn_add_section: "+ Bölüm Ekle",
        btn_load_sample: "📄 Örnek CV Yükle",
        btn_design: "🎨 Tasarım",
        btn_change_tpl: "🎨 Şablonu Değiştir",
        btn_download_pdf: "🖨️ PDF İndir",
        btn_reset: "🗑️ Sıfırla",
        btn_logout: "Çıkış Yap",
        btn_ai_upload: "PDF Yükle (Otomatik)",
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
        ai_analyzing: "Dosya İşleniyor...",
        ai_desc: "Verileriniz script ile ayrıştırılıyor.",
        ai_success: "PDF başarıyla işlendi!",
        ai_error: "PDF okunamadı. Lütfen metin tabanlı (taranmamış) bir PDF yükleyin."
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
        btn_ai_upload: "Upload PDF (Auto)",
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
        ai_analyzing: "Processing File...",
        ai_desc: "Parsing data via script.",
        ai_success: "PDF parsed successfully!",
        ai_error: "Could not read PDF. Please use a text-based (not scanned) PDF."
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

// --- FILE UPLOAD & REGEX PARSER FUNCTIONALITY ---
window.triggerFileUpload = () => {
    document.getElementById('cv-upload').click();
};

window.handleFileUpload = async (input) => {
    if (input.files.length === 0) return;
    const file = input.files[0];

    // Only allow PDF for client-side parsing script
    if (file.type !== 'application/pdf') {
        alert("Lütfen geçerli bir PDF dosyası yükleyin. (Görüntü/Resim formatı desteklenmemektedir)");
        return;
    }
    
    // Show Loading
    document.getElementById('ai-loading').classList.add('active');

    const fileReader = new FileReader();
    fileReader.onload = async function(e) {
        const typedarray = new Uint8Array(e.target.result);

        try {
            await extractAndParsePDF(typedarray);
        } catch (error) {
            console.error("Parsing Error:", error);
            alert(translations[currentLang].ai_error);
        } finally {
            document.getElementById('ai-loading').classList.remove('active');
        }
    };
    fileReader.readAsArrayBuffer(file);
    input.value = '';
};

async function extractAndParsePDF(pdfData) {
    const pdf = await pdfjsLib.getDocument(pdfData).promise;
    let fullText = "";

    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + "\n";
    }

    // Process text with REGEX Script
    const parsedData = parseCVTextBasic(fullText);
    populateCVFromJSON(parsedData);
    showToast(translations[currentLang].ai_success);
}

// === THE "SCRIPT" - REGEX PARSER LOGIC ===
function parseCVTextBasic(text) {
    const data = {
        fullName: "",
        title: "",
        contact: { location: "", phone: "", email: "", fullAddress: "" },
        personal: { birthPlace: "", license: "" },
        profile: "",
        experience: [],
        education: [],
        certifications: []
    };

    // 1. CLEANUP
    // Remove multiple spaces and newlines
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // 2. EXTRACT CONTACT INFO (Regex)
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const emailMatch = cleanText.match(emailRegex);
    if (emailMatch) data.contact.email = emailMatch[0];

    // Basic Phone Match (Turkey specific + Generic)
    const phoneRegex = /(?:\+90|0)?\s*[0-9]{3}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}/;
    const phoneMatch = cleanText.match(phoneRegex);
    if (phoneMatch) data.contact.phone = phoneMatch[0];

    // 3. GUESS NAME (Heuristic: Usually at start, uppercase)
    // We take the first non-empty sequence that doesn't look like a label
    // This is hard without AI, so we'll guess the very first few words.
    const words = cleanText.split(' ');
    // Take first 2-3 words as name if they don't contain numbers/symbols
    let nameGuess = words.slice(0, 2).join(' ');
    if (nameGuess.length > 3 && !/[0-9]/.test(nameGuess)) {
        data.fullName = nameGuess;
    }

    // 4. FIND SECTIONS BY KEYWORDS
    // We look for keyword indices to slice the text
    const keywords = {
        experience: ["İŞ DENEYİMİ", "WORK EXPERIENCE", "DENEYİM", "EXPERIENCE"],
        education: ["EĞİTİM", "EDUCATION", "AKADEMİK", "UNIVERSITY"],
        skills: ["YETENEKLER", "SKILLS", "BECERİLER"],
        certifications: ["SERTİFİKALAR", "CERTIFICATES", "CERTIFICATIONS"],
        contact: ["İLETİŞİM", "CONTACT"]
    };

    // Helper to find position of sections
    function findSectionStart(text, keys) {
        for (let key of keys) {
            let idx = text.toUpperCase().indexOf(key);
            if (idx !== -1) return idx;
        }
        return -1;
    }

    const expIdx = findSectionStart(cleanText, keywords.experience);
    const eduIdx = findSectionStart(cleanText, keywords.education);
    const certIdx = findSectionStart(cleanText, keywords.certifications);
    
    // Sort indices to know where a section ends (it ends where next one begins)
    const indices = [
        { type: 'experience', idx: expIdx },
        { type: 'education', idx: eduIdx },
        { type: 'certifications', idx: certIdx }
    ].filter(x => x.idx !== -1).sort((a, b) => a.idx - b.idx);

    // Extract content based on sorted indices
    indices.forEach((item, i) => {
        const start = item.idx;
        const end = indices[i + 1] ? indices[i + 1].idx : cleanText.length;
        const sectionContent = cleanText.substring(start, end); // Keep 'cleanText' raw for better slicing? Actually processed text is flat.
        
        // Remove the header title itself from content
        // This is a rough split, naive but functional for a script
        let contentClean = sectionContent.substring(15); // Skip approximate header length
        
        if (item.type === 'experience') {
            // Split by common delimiters or just dump as one block for user to edit
            // Creating a dummy entry because we can't parse structured job objects easily with regex
            data.experience.push({
                date: "...",
                title: "Bulunan Deneyim Verisi",
                company: "",
                description: contentClean.substring(0, 300) + "..." // Limit length
            });
        }
        if (item.type === 'education') {
            data.education.push({
                date: "...",
                degree: "Bulunan Eğitim Verisi",
                school: contentClean.substring(0, 150) + "..."
            });
        }
        if (item.type === 'certifications') {
             // Split by bullets or newlines if possible, here just splitting by comma as a guess
             const parts = contentClean.split(/(?:,|•|-)/).filter(s => s.length > 5);
             parts.slice(0, 4).forEach(p => {
                 data.certifications.push({ name: p.trim(), provider: "" });
             });
        }
    });

    return data;
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
