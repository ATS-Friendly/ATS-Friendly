
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
// Layout Defaults
let currentLayout = {
    fontSize: 11,
    lineHeight: 1.4,
    margin: 20,
    sectionGap: 15
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
        btn_design: "Tasarım Ayarları",
        btn_layout: "Sayfa Düzeni",
        btn_change_tpl: "Şablonu Değiştir",
        btn_download_pdf: "PDF İndir",
        btn_reset: "Sıfırla / Temizle",
        btn_logout: "Çıkış Yap",
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
        modal_layout_title: "Sayfa Düzeni",
        lbl_color: "Vurgu Rengi",
        lbl_font: "Yazı Tipi",
        lbl_fontsize: "Yazı Boyutu",
        lbl_lineheight: "Satır Aralığı",
        lbl_margin: "Kenar Boşluğu",
        lbl_sectiongap: "Bölüm Aralığı",
        btn_save_close: "Kapat",
        // Form Translations
        form_title: "Bilgilerinizi Düzenleyin",
        form_personal: "Kişisel Bilgiler",
        form_profile: "Profil Özeti",
        form_experience: "İş Deneyimi",
        form_education: "Eğitim",
        form_custom: "Özel Bölümler",
        form_lbl_fullname: "Ad Soyad",
        form_lbl_title: "Unvan",
        form_lbl_email: "E-posta",
        form_lbl_phone: "Telefon",
        form_lbl_address: "Adres",
        btn_add_job: "İş Ekle",
        btn_add_edu: "Okul Ekle",
        btn_add_custom: "Bölüm Ekle",
        lbl_job_title: "Pozisyon Adı",
        lbl_company: "Şirket",
        lbl_date: "Tarih",
        lbl_desc: "Açıklama",
        lbl_school: "Okul / Üniversite",
        lbl_degree: "Bölüm / Derece",
        lbl_section_title: "Bölüm Başlığı",
        lbl_section_content: "İçerik / Açıklama"
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
        btn_design: "Design Settings",
        btn_layout: "Page Layout",
        btn_change_tpl: "Change Template",
        btn_download_pdf: "Download PDF",
        btn_reset: "Reset / Clear",
        btn_logout: "Logout",
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
        modal_layout_title: "Page Layout",
        lbl_color: "Accent Color",
        lbl_font: "Font Family",
        lbl_fontsize: "Font Size",
        lbl_lineheight: "Line Height",
        lbl_margin: "Margin",
        lbl_sectiongap: "Section Gap",
        btn_save_close: "Close",
        // Form Translations
        form_title: "Edit Your Details",
        form_personal: "Personal Details",
        form_profile: "Professional Summary",
        form_experience: "Work Experience",
        form_education: "Education",
        form_custom: "Custom Sections",
        form_lbl_fullname: "Full Name",
        form_lbl_title: "Job Title",
        form_lbl_email: "Email",
        form_lbl_phone: "Phone",
        form_lbl_address: "Address",
        btn_add_job: "Add Job",
        btn_add_edu: "Add Education",
        btn_add_custom: "Add Section",
        lbl_job_title: "Job Title",
        lbl_company: "Company",
        lbl_date: "Date",
        lbl_desc: "Description",
        lbl_school: "School / University",
        lbl_degree: "Degree / Field",
        lbl_section_title: "Section Title",
        lbl_section_content: "Content / Description"
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

    // Update Form Labels that might be dynamic
    document.getElementById('auth-toggle-text').innerText = isLoginMode ? translations[lang].auth_toggle_signup : translations[lang].auth_toggle_login;
    
    // Refresh CV Preview to apply language changes (e.g. section headers)
    generateCVFromForm();
};

// --- EKRAN YÖNETİMİ ---
function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');
    
    // Reset Mobile View to Form when switching screens
    if(viewId === 'editor-view') {
        window.toggleMobileView('form');
    }
}

// --- MOBILE VIEW MANAGEMENT ---
window.toggleMobileView = (mode) => {
    const layout = document.querySelector('.editor-layout');
    const btnForm = document.getElementById('btn-show-form');
    const btnPreview = document.getElementById('btn-show-preview');
    
    if (mode === 'form') {
        layout.classList.add('mobile-show-form');
        layout.classList.remove('mobile-show-preview');
        btnForm.classList.add('active');
        btnPreview.classList.remove('active');
    } else {
        layout.classList.add('mobile-show-preview');
        layout.classList.remove('mobile-show-form');
        btnForm.classList.remove('active');
        btnPreview.classList.add('active');
        
        // Trigger resize to scale content after it becomes visible
        setTimeout(window.resizePreview, 50);
    }
};

// --- AUTO SCALE PREVIEW FOR MOBILE ---
window.resizePreview = () => {
    if (window.innerWidth > 1024) {
        // Desktop: Reset
        const container = document.getElementById('cv-scale-container');
        if(container) container.style.transform = 'none';
        return;
    }

    const previewPanel = document.getElementById('panel-preview');
    const scaleContainer = document.getElementById('cv-scale-container');
    const page = document.getElementById('cv-root');
    
    if (!previewPanel || !scaleContainer || !page) return;

    // Calculate available width vs needed width
    // 210mm is approx 794px at 96dpi. We use scrollWidth to get the real pixel width.
    const pageWidth = 794; // Standard A4 width in pixels roughly
    const availableWidth = previewPanel.clientWidth - 20; // 20px padding
    
    const scale = availableWidth / pageWidth;
    
    if (scale < 1) {
        scaleContainer.style.transform = `scale(${scale})`;
        // Adjust the height of the container so scrolling works properly with the scaled content
        // 1123 is approx A4 height in pixels
        const scaledHeight = 1123 * scale;
        scaleContainer.style.height = scaledHeight + 'px';
        scaleContainer.style.width = pageWidth + 'px'; // Fix width to prevent wrapping before scale
    } else {
        scaleContainer.style.transform = 'none';
        scaleContainer.style.height = 'auto';
        scaleContainer.style.width = 'auto';
    }
};

// Listen for window resize
window.addEventListener('resize', window.resizePreview);


// --- MODAL YÖNETİMİ (TEMA & LAYOUT) ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    
    // Center modal or simple fixed positioning for mobile stability
    if(window.innerWidth > 1024) {
        if (!modal.style.top || !modal.style.left) {
            modal.style.top = "100px";
            const initialLeft = Math.max(20, window.innerWidth - 360);
            modal.style.left = initialLeft + "px";
        }
        initDragElement(modal.querySelector('.modal-content'));
    } else {
        // Mobile positioning handled by CSS (bottom sheet)
        // Reset inline styles if any
        const content = modal.querySelector('.modal-content');
        content.style.top = '';
        content.style.left = '';
        content.style.transform = '';
    }
}

window.openThemeModal = () => openModal('theme-modal');
window.closeThemeModal = () => {
    document.getElementById('theme-modal').classList.remove('active');
    saveToCloud(); 
};

window.openLayoutModal = () => {
    // Sync slider values with current state
    document.getElementById('rng-fontsize').value = currentLayout.fontSize;
    document.getElementById('val-fontsize').innerText = currentLayout.fontSize + 'pt';

    document.getElementById('rng-lineheight').value = currentLayout.lineHeight;
    document.getElementById('val-lineheight').innerText = currentLayout.lineHeight;

    document.getElementById('rng-margin').value = currentLayout.margin;
    document.getElementById('val-margin').innerText = currentLayout.margin + 'mm';
    
    document.getElementById('rng-sectiongap').value = currentLayout.sectionGap;
    document.getElementById('val-sectiongap').innerText = currentLayout.sectionGap + 'px';

    openModal('layout-modal');
};

window.closeLayoutModal = () => {
    document.getElementById('layout-modal').classList.remove('active');
    saveToCloud();
};


function initDragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = elmnt.querySelector(".modal-header");
    if (header) header.onmousedown = dragMouseDown;

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

// --- TEMA VE STİL UYGULAMALARI ---
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

window.updateLayout = () => {
    const fs = document.getElementById('rng-fontsize').value;
    const lh = document.getElementById('rng-lineheight').value;
    const mg = document.getElementById('rng-margin').value;
    const sg = document.getElementById('rng-sectiongap').value;

    currentLayout = { fontSize: fs, lineHeight: lh, margin: mg, sectionGap: sg };

    // Update UI Labels
    document.getElementById('val-fontsize').innerText = fs + 'pt';
    document.getElementById('val-lineheight').innerText = lh;
    document.getElementById('val-margin').innerText = mg + 'mm';
    document.getElementById('val-sectiongap').innerText = sg + 'px';

    // Apply CSS Variables
    document.documentElement.style.setProperty('--cv-font-size', fs + 'pt');
    document.documentElement.style.setProperty('--cv-line-height', lh);
    document.documentElement.style.setProperty('--cv-padding', mg + 'mm');
    document.documentElement.style.setProperty('--cv-section-gap', sg + 'px');
};

function applySavedLayout(layout) {
    if(!layout) return;
    currentLayout = layout;
    document.documentElement.style.setProperty('--cv-font-size', layout.fontSize + 'pt');
    document.documentElement.style.setProperty('--cv-line-height', layout.lineHeight);
    document.documentElement.style.setProperty('--cv-padding', layout.margin + 'mm');
    document.documentElement.style.setProperty('--cv-section-gap', layout.sectionGap + 'px');
}

// --- AUTH ---
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
    } catch (e) { alert("Error: " + e.message); }
};

window.logout = () => signOut(auth).then(() => {
    localStorage.removeItem('monoCvData_v2');
    location.reload();
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'cvContent');
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
            const data = snap.data();
            // Load saved data into form inputs
            if (data.formData) {
                loadUserDataIntoForm(data.formData);
            }
            
            document.body.className = data.template || '';
            if (data.theme) {
                currentTheme = data.theme;
                window.applyColor(currentTheme.color);
                window.applyFont(currentTheme.font);
            }
            
            if (data.layout) {
                applySavedLayout(data.layout);
            }
            
            showView('editor-view');
            generateCVFromForm(); // Render CV based on form data
            updateStatus('online');
        } else {
            showView('template-view');
        }
    } else {
        showView('auth-view');
    }
});

// --- EDITOR LOGIC ---
window.selectTemplate = (tpl) => {
    document.body.className = tpl;
    showView('editor-view');
    generateCVFromForm();
};

window.backToTemplates = () => {
    saveToCloud(); 
    showView('template-view');
};

// --- DYNAMIC FORM HANDLERS ---
window.addFormExperience = (data = null) => {
    const container = document.getElementById('form-experiences-list');
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    const t = translations[currentLang];
    
    div.innerHTML = `
        <button class="remove-dynamic-btn" onclick="removeItemAndRefresh(this)">×</button>
        <div class="input-grid">
            <div class="input-group">
                <label>${t.lbl_job_title}</label>
                <input type="text" class="form-input job-title" placeholder="Ex: Manager" value="${data ? data.title : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group">
                <label>${t.lbl_company}</label>
                <input type="text" class="form-input job-company" placeholder="Ex: Google" value="${data ? data.company : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group full-width">
                <label>${t.lbl_date}</label>
                <input type="text" class="form-input job-date" placeholder="Ex: Jan 2020 - Present" value="${data ? data.date : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group full-width">
                <label>${t.lbl_desc}</label>
                <textarea class="form-input job-desc" rows="3" oninput="generateCVFromForm()">${data ? data.desc : ''}</textarea>
            </div>
        </div>
    `;
    container.appendChild(div);
    if (!data) generateCVFromForm();
};

window.addFormEducation = (data = null) => {
    const container = document.getElementById('form-education-list');
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    const t = translations[currentLang];
    
    div.innerHTML = `
        <button class="remove-dynamic-btn" onclick="removeItemAndRefresh(this)">×</button>
        <div class="input-grid">
            <div class="input-group">
                <label>${t.lbl_school}</label>
                <input type="text" class="form-input edu-school" placeholder="Ex: MIT" value="${data ? data.school : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group">
                <label>${t.lbl_degree}</label>
                <input type="text" class="form-input edu-degree" placeholder="Ex: CS" value="${data ? data.degree : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group full-width">
                <label>${t.lbl_date}</label>
                <input type="text" class="form-input edu-date" placeholder="Ex: 2015 - 2019" value="${data ? data.date : ''}" oninput="generateCVFromForm()">
            </div>
        </div>
    `;
    container.appendChild(div);
    if (!data) generateCVFromForm();
};

window.addFormCustomSection = (data = null) => {
    const container = document.getElementById('form-custom-list');
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    const t = translations[currentLang];
    
    div.innerHTML = `
        <button class="remove-dynamic-btn" onclick="removeItemAndRefresh(this)">×</button>
        <div class="input-group" style="margin-bottom:10px;">
            <label>${t.lbl_section_title}</label>
            <input type="text" class="form-input custom-title" placeholder="Ex: Certificates" value="${data ? data.title : ''}" oninput="generateCVFromForm()">
        </div>
        <div class="input-group full-width">
            <label>${t.lbl_section_content}</label>
            <textarea class="form-input custom-content" rows="3" placeholder="Details..." oninput="generateCVFromForm()">${data ? data.content : ''}</textarea>
        </div>
    `;
    container.appendChild(div);
    if (!data) generateCVFromForm();
};

window.removeItemAndRefresh = (btn) => {
    btn.parentElement.remove();
    generateCVFromForm();
};

// --- DATA BINDING ---
window.generateCVFromForm = () => {
    // 1. Gather Data from DOM Inputs
    const data = {
        fullname: document.getElementById('inp-fullname').value,
        title: document.getElementById('inp-title').value,
        email: document.getElementById('inp-email').value,
        phone: document.getElementById('inp-phone').value,
        address: document.getElementById('inp-address').value,
        birthplace: document.getElementById('inp-birthplace').value,
        license: document.getElementById('inp-license').value,
        summary: document.getElementById('inp-summary').value,
        experiences: [],
        education: [],
        customSections: []
    };

    document.querySelectorAll('#form-experiences-list .dynamic-item').forEach(item => {
        data.experiences.push({
            title: item.querySelector('.job-title').value,
            company: item.querySelector('.job-company').value,
            date: item.querySelector('.job-date').value,
            desc: item.querySelector('.job-desc').value
        });
    });

    document.querySelectorAll('#form-education-list .dynamic-item').forEach(item => {
        data.education.push({
            school: item.querySelector('.edu-school').value,
            degree: item.querySelector('.edu-degree').value,
            date: item.querySelector('.edu-date').value
        });
    });

    document.querySelectorAll('#form-custom-list .dynamic-item').forEach(item => {
        data.customSections.push({
            title: item.querySelector('.custom-title').value,
            content: item.querySelector('.custom-content').value
        });
    });

    // 2. Generate HTML
    const isCompact = document.body.classList.contains('tpl-compact');
    let html = "";
    
    // Labels based on Lang
    const labels = {
        exp: currentLang === 'tr' ? 'İŞ DENEYİMİ' : 'EMPLOYMENT HISTORY',
        edu: currentLang === 'tr' ? 'EĞİTİM' : 'EDUCATION',
        prof: currentLang === 'tr' ? 'PROFİL' : 'PROFILE',
        birth: translations[currentLang].cv_label_birth,
        lic: translations[currentLang].cv_label_license
    };

    // GENERATE SECTION CONTENT (Grouped)
    
    // -- EXPERIENCES --
    let expContent = "";
    if (data.experiences.length > 0) {
        let entries = data.experiences.map(exp => `
            <div class="entry">
                <div class="left-col">${exp.date}</div>
                <div class="right-col"><h3>${exp.title}, ${exp.company}</h3><p>${exp.desc.replace(/\n/g, '<br>')}</p></div>
            </div>`).join('');
        
        expContent = `
            <div class="section">
                <div class="section-header"><span class="section-title">${labels.exp}</span></div>
                ${entries}
            </div>`;
    }

    // -- EDUCATION --
    let eduContent = "";
    if (data.education.length > 0) {
        let entries = data.education.map(edu => `
            <div class="entry">
                <div class="left-col">${edu.date}</div>
                <div class="right-col"><h3>${edu.degree}</h3><p>${edu.school}</p></div>
            </div>`).join('');

        eduContent = `
            <div class="section">
                <div class="section-header"><span class="section-title">${labels.edu}</span></div>
                ${entries}
            </div>`;
    }

    // -- CUSTOM SECTIONS --
    let customContent = "";
    if (data.customSections.length > 0) {
        customContent = data.customSections.map(sec => `
            <div class="section">
                <div class="section-header"><span class="section-title">${sec.title}</span></div>
                <div class="entry">
                    <div class="right-col"><p>${sec.content.replace(/\n/g, '<br>')}</p></div>
                </div>
            </div>
        `).join('');
    }


    if (isCompact) {
        html = `
        <header>
            <h1>${data.fullname || 'ADINIZ SOYADINIZ'}</h1>
            <div class="subtitle">${data.title}</div>
            <div class="address-line">${data.address}</div>
            <div class="contact-row"><span>${data.phone}</span><span>${data.email}</span></div>
            <div class="compact-separator"></div>
            <div class="personal-details">
                <div class="detail-item"><span class="lbl">${labels.birth}</span><span class="dots"></span><span class="val">${data.birthplace}</span></div>
                <div class="detail-item"><span class="lbl">${labels.lic}</span><span class="dots"></span><span class="val">${data.license}</span></div>
            </div>
        </header>
        <div id="main-content">
             <div class="section">
                <div class="section-header"><span class="section-title">${labels.prof}</span></div>
                <div class="entry"><div class="right-col">${data.summary}</div></div>
            </div>
            ${expContent}
            ${eduContent}
            ${customContent}
        </div>`;

    } else {
        html = `
        <header>
            <h1>${data.fullname || 'ADINIZ SOYADINIZ'}</h1>
            <div class="subtitle">${data.title}</div>
            <div class="contact-info">
                <span>📍 ${data.address}</span> | <span>📞 ${data.phone}</span> | <span>✉️ ${data.email}</span>
            </div>
            <!-- Hidden Fields for switch compatibility -->
            <div class="address-line" style="display:none">${data.address}</div>
            <div class="contact-row" style="display:none"><span>${data.phone}</span><span>${data.email}</span></div>
            <div class="personal-details" style="display:none">
                 <div class="detail-item"><span class="lbl">${labels.birth}</span><span class="dots"></span><span class="val">${data.birthplace}</span></div>
                <div class="detail-item"><span class="lbl">${labels.lic}</span><span class="dots"></span><span class="val">${data.license}</span></div>
            </div>
        </header>
        <div id="main-content">
             <div class="section">
                <div class="section-header"><span class="section-title">${labels.prof}</span></div>
                <div class="entry"><div class="right-col">${data.summary}</div></div>
            </div>
            ${expContent}
            ${eduContent}
            ${customContent}
        </div>`;
    }

    document.getElementById('cv-root').innerHTML = html;
    saveToCloud(data); // Save the form data structure
    
    // Trigger scale update if on mobile preview
    if(window.innerWidth <= 1024) {
        setTimeout(window.resizePreview, 10);
    }
};

function loadUserDataIntoForm(data) {
    document.getElementById('inp-fullname').value = data.fullname || '';
    document.getElementById('inp-title').value = data.title || '';
    document.getElementById('inp-email').value = data.email || '';
    document.getElementById('inp-phone').value = data.phone || '';
    document.getElementById('inp-address').value = data.address || '';
    document.getElementById('inp-birthplace').value = data.birthplace || '';
    document.getElementById('inp-license').value = data.license || '';
    document.getElementById('inp-summary').value = data.summary || '';

    const expList = document.getElementById('form-experiences-list');
    expList.innerHTML = '';
    if (data.experiences) {
        data.experiences.forEach(exp => addFormExperience(exp));
    }

    const eduList = document.getElementById('form-education-list');
    eduList.innerHTML = '';
    if (data.education) {
        data.education.forEach(edu => addFormEducation(edu));
    }

    const customList = document.getElementById('form-custom-list');
    customList.innerHTML = '';
    if (data.customSections) {
        data.customSections.forEach(sec => addFormCustomSection(sec));
    }
}

// --- SAVE / LOAD ---
async function saveToCloud(formData = null) {
    if (!currentUser || isSyncing) return;
    
    // If formData is not passed (e.g. template change), gather it
    if (!formData) {
        // ... gather logic similar to generateCVFromForm or store state globally
        // For simplicity, we assume this function is usually called by generateCVFromForm
        return; 
    }

    isSyncing = true;
    updateStatus('syncing');
    
    const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'data', 'cvContent');
    
    try {
        await setDoc(docRef, { 
            formData: formData, // Store structured data
            template: document.body.className,
            theme: currentTheme,
            layout: currentLayout,
            updatedAt: new Date().toISOString() 
        }, { merge: true });
        updateStatus('online');
    } catch (e) { 
        updateStatus('error'); 
        console.error("Save failed:", e);
    } finally {
        isSyncing = false;
        
        // Mobile specific toast handling
        const t = document.getElementById('toast');
        t.innerText = translations[currentLang].status_syncing.replace('...','!');
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2000);
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

// --- RESET ---
window.resetAll = async (skipConfirm = false) => {
    if(!skipConfirm && !confirm(translations[currentLang].confirm_reset)) return;
    
    // Clear Form Inputs
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(i => i.value = '');
    document.getElementById('form-experiences-list').innerHTML = '';
    document.getElementById('form-education-list').innerHTML = '';
    document.getElementById('form-custom-list').innerHTML = '';
    
    generateCVFromForm();
    if(!skipConfirm) {
        const t = document.getElementById('toast');
        t.innerText = translations[currentLang].toast_reset;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    }
};

window.createNewSection = () => {
    // This is deprecated, handled by addFormCustomSection now
    alert("Yeni sistemde 'Özel Bölümler' alanını kullanarak ekleme yapabilirsiniz.");
};
