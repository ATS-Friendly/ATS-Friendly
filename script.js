
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
let isLoadingData = false; // CRITICAL FIX for Race Condition
let saveTimeout = null; 
let currentLang = 'tr';

let currentTheme = { color: '#2c3e50', font: 'ptserif' };
let currentLayout = { fontSize: 11, lineHeight: 1.4, margin: 20, sectionGap: 15 };

// --- DİL YÖNETİMİ ---
const translations = {
    tr: {
        land_login: "Giriş Yap",
        land_signup: "Kayıt Ol",
        land_hero_title: "İşe Alım Robotlarını<br><span class='highlight-text'>Yenecek CV'nizi Oluşturun</span>",
        land_hero_sub: "Modern işe alım sistemleri (ATS) ile %100 uyumlu.",
        land_cta_start: "Hemen Ücretsiz Başla",
        land_cta_how: "Nasıl Çalışır?",
        feat_ats_title: "ATS Dostu Format",
        feat_ats_desc: "Okunabilir temiz kod yapısı.",
        feat_free_title: "%100 Ücretsiz",
        feat_free_desc: "Gizli ödeme yok.",
        feat_cloud_title: "Bulut Kayıt",
        feat_cloud_desc: "Her yerden erişim.",
        footer_rights: "Tüm hakları saklıdır.",
        footer_privacy: "Gizlilik",
        footer_terms: "Koşullar",
        footer_contact: "İletişim",
        
        back_home: "Ana Sayfa",
        auth_title: "Giriş Yap",
        auth_subtitle_login: "Devam et",
        auth_title_signup: "Hesap Oluştur",
        auth_subtitle_signup: "Hemen başla",
        auth_btn_login: "Giriş",
        auth_btn_signup: "Kayıt Ol",
        auth_toggle_msg_login: "Hesabın yok mu?",
        auth_toggle_link_login: "Kayıt Ol",
        auth_toggle_msg_signup: "Zaten hesabın var mı?",
        auth_toggle_link_signup: "Giriş Yap",
        lbl_email_addr: "E-posta",
        lbl_password: "Şifre",
        auth_google_continue: "Google ile Devam",
        auth_processing: "İşleniyor...",

        form_title: "Bilgileri Düzenle",
        form_personal: "Kişisel Bilgiler",
        form_profile: "Profil Özeti",
        form_experience: "İş Deneyimi",
        form_education: "Eğitim",
        form_certificates: "Sertifikalar",
        form_references: "Referanslar",
        form_custom: "Diğer",
        
        form_lbl_fullname: "Ad Soyad",
        form_lbl_title: "Unvan",
        form_lbl_email: "E-posta",
        form_lbl_phone: "Tel",
        form_lbl_address: "Adres",
        cv_label_birth: "Doğum Yeri",
        cv_label_license: "Ehliyet",
        
        btn_add_job: "İş Ekle",
        btn_add_edu: "Okul Ekle",
        btn_add_cert: "Sertifika Ekle",
        btn_add_ref: "Referans Ekle",
        btn_add_custom: "Bölüm Ekle",
        
        lbl_job_title: "Pozisyon",
        lbl_company: "Şirket",
        lbl_date: "Tarih",
        lbl_desc: "Açıklama",
        lbl_school: "Okul",
        lbl_degree: "Bölüm",
        lbl_cert_name: "Sertifika Adı",
        lbl_cert_issuer: "Kurum",
        lbl_ref_name: "Ad Soyad",
        lbl_ref_phone: "Tel No",
        
        tab_edit: "Düzenle",
        tab_preview: "Önizle",
        tab_download: "İndir",
        mobile_design_settings: "Tasarım Ayarları",
        status_connecting: "Bağlanıyor...",
        status_online: "Senkronize",
        status_syncing: "Kaydediliyor..."
    },
    en: {
        land_login: "Login",
        land_signup: "Sign Up",
        land_hero_title: "Create a CV That<br><span class='highlight-text'>Beats ATS</span>",
        land_hero_sub: "100% ATS compatible.",
        land_cta_start: "Start Free",
        land_cta_how: "How?",
        feat_ats_title: "ATS Friendly",
        feat_ats_desc: "Clean code structure.",
        feat_free_title: "100% Free",
        feat_free_desc: "No hidden fees.",
        feat_cloud_title: "Cloud Save",
        feat_cloud_desc: "Access anywhere.",
        footer_rights: "All rights reserved.",
        footer_privacy: "Privacy",
        footer_terms: "Terms",
        footer_contact: "Contact",
        
        back_home: "Home",
        auth_title: "Login",
        auth_subtitle_login: "Welcome back",
        auth_title_signup: "Create Account",
        auth_subtitle_signup: "Start now",
        auth_btn_login: "Login",
        auth_btn_signup: "Sign Up",
        auth_toggle_msg_login: "No account?",
        auth_toggle_link_login: "Sign Up",
        auth_toggle_msg_signup: "Have account?",
        auth_toggle_link_signup: "Login",
        lbl_email_addr: "Email",
        lbl_password: "Password",
        auth_google_continue: "Continue w/ Google",
        auth_processing: "Processing...",

        form_title: "Edit Details",
        form_personal: "Personal Info",
        form_profile: "Summary",
        form_experience: "Experience",
        form_education: "Education",
        form_certificates: "Certificates",
        form_references: "References",
        form_custom: "Other",
        
        form_lbl_fullname: "Full Name",
        form_lbl_title: "Job Title",
        form_lbl_email: "Email",
        form_lbl_phone: "Phone",
        form_lbl_address: "Address",
        cv_label_birth: "Birth Place",
        cv_label_license: "License",
        
        btn_add_job: "Add Job",
        btn_add_edu: "Add School",
        btn_add_cert: "Add Cert",
        btn_add_ref: "Add Ref",
        btn_add_custom: "Add Section",
        
        lbl_job_title: "Title",
        lbl_company: "Company",
        lbl_date: "Date",
        lbl_desc: "Description",
        lbl_school: "School",
        lbl_degree: "Degree",
        lbl_cert_name: "Certificate Name",
        lbl_cert_issuer: "Issuer",
        lbl_ref_name: "Name",
        lbl_ref_phone: "Phone",
        
        tab_edit: "Edit",
        tab_preview: "Preview",
        tab_download: "Download",
        mobile_design_settings: "Design Settings",
        status_connecting: "Connecting...",
        status_online: "Synced",
        status_syncing: "Saving..."
    }
};

window.setLanguage = (lang) => {
    currentLang = lang;
    document.getElementById('lang-select').value = lang; // sync selector
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            if (el.innerHTML.includes('<')) el.innerHTML = translations[lang][key];
            else el.innerText = translations[lang][key];
        }
    });
    updateAuthUI();
    generateCVFromForm(false);
};

// --- EKRAN YÖNETİMİ ---
window.showView = (viewId) => {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    if (viewId === 'editor-view') {
        // Default mobile tab
        window.switchMobileTab('edit');
        
        // Populate Mobile Design Controls
        copyDesignControlsToMobile();
    }
};

// --- MOBILE TAB SYSTEM ---
window.switchMobileTab = (tabName) => {
    // Reset tabs
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.editor-panel-form, .editor-panel-preview').forEach(p => p.classList.remove('active-mobile-tab'));
    
    if (tabName === 'edit') {
        document.querySelector('.nav-tab[onclick*="edit"]').classList.add('active');
        document.querySelector('.editor-panel-form').classList.add('active-mobile-tab');
    } else if (tabName === 'preview') {
        document.querySelector('.nav-tab[onclick*="preview"]').classList.add('active');
        document.querySelector('.editor-panel-preview').classList.add('active-mobile-tab');
        setTimeout(window.resizePreview, 100); // Trigger resize check
    }
};

window.copyDesignControlsToMobile = () => {
    // Copy Colors
    const desktopColors = document.querySelector('.color-options').innerHTML;
    document.getElementById('mobile-color-row').innerHTML = desktopColors;
    
    // Copy Fonts
    const desktopFonts = document.querySelector('.font-options-grid').innerHTML;
    document.getElementById('mobile-font-row').innerHTML = desktopFonts;
    
    // Sync Sliders
    document.getElementById('mob-rng-fontsize').value = currentLayout.fontSize;
    document.getElementById('mob-rng-sectiongap').value = currentLayout.sectionGap;
};

window.syncMobileSlider = (type, val) => {
    if(type === 'fontsize') {
        currentLayout.fontSize = val;
        document.documentElement.style.setProperty('--cv-font-size', val + 'pt');
        document.getElementById('rng-fontsize').value = val;
    }
    if(type === 'sectiongap') {
        currentLayout.sectionGap = val;
        document.documentElement.style.setProperty('--cv-section-gap', val + 'px');
        document.getElementById('rng-sectiongap').value = val;
    }
    // Mobile change triggers save
    triggerDebounceSave();
};

// --- AUTO SCALE PREVIEW ---
window.resizePreview = () => {
    const scaleContainer = document.getElementById('cv-scale-container');
    const cvRoot = document.getElementById('cv-root');
    if (!scaleContainer || !cvRoot) return;

    if (window.innerWidth > 1024) {
        cvRoot.style.transform = 'none';
        scaleContainer.style.width = 'auto';
        scaleContainer.style.height = 'auto';
        return;
    }

    // Mobile Scale Logic
    const originalWidth = 794; 
    const padding = 20; 
    const availableWidth = window.innerWidth - padding;
    const scale = Math.min(1, availableWidth / originalWidth);
    
    cvRoot.style.transformOrigin = 'top center'; 
    cvRoot.style.transform = `scale(${scale})`;
    
    const scaledHeight = cvRoot.scrollHeight * scale;
    scaleContainer.style.width = `${originalWidth * scale}px`;
    scaleContainer.style.height = `${scaledHeight}px`;
};
window.addEventListener('resize', window.resizePreview);

// --- MODALS ---
window.openModal = (id) => {
    if(window.innerWidth <= 1024) return; // Disable modals on mobile (using embedded controls)
    document.getElementById(id).classList.add('active');
    initDragElement(document.getElementById(id).querySelector('.modal-content'));
};
window.openThemeModal = () => openModal('theme-modal');
window.openLayoutModal = () => openModal('layout-modal');
window.closeThemeModal = () => { document.getElementById('theme-modal').classList.remove('active'); saveToCloud(); };
window.closeLayoutModal = () => { document.getElementById('layout-modal').classList.remove('active'); saveToCloud(); };

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

// --- DESIGN ---
window.applyColor = (color) => {
    currentTheme.color = color;
    document.documentElement.style.setProperty('--cv-accent-color', color);
    triggerDebounceSave();
};
window.applyFont = (fontType) => {
    currentTheme.font = fontType;
    let fontVal = "'PT Serif', serif";
    if(fontType === 'roboto') fontVal = "'Roboto', sans-serif";
    if(fontType === 'opensans') fontVal = "'Open Sans', sans-serif";
    if(fontType === 'montserrat') fontVal = "'Montserrat', sans-serif";
    if(fontType === 'lato') fontVal = "'Lato', sans-serif";
    if(fontType === 'raleway') fontVal = "'Raleway', sans-serif";
    document.documentElement.style.setProperty('--font-cv', fontVal);
    triggerDebounceSave();
};
window.updateLayout = () => {
    currentLayout.fontSize = document.getElementById('rng-fontsize').value;
    currentLayout.lineHeight = document.getElementById('rng-lineheight').value;
    currentLayout.margin = document.getElementById('rng-margin').value;
    currentLayout.sectionGap = document.getElementById('rng-sectiongap').value;
    
    document.documentElement.style.setProperty('--cv-font-size', currentLayout.fontSize + 'pt');
    document.documentElement.style.setProperty('--cv-line-height', currentLayout.lineHeight);
    document.documentElement.style.setProperty('--cv-padding', currentLayout.margin + 'mm');
    document.documentElement.style.setProperty('--cv-section-gap', currentLayout.sectionGap + 'px');
};

// --- AUTH ---
window.loginWithGoogle = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (e) { alert(e.message); }
};
window.toggleAuthMode = () => { isLoginMode = !isLoginMode; updateAuthUI(); };
window.handleAuth = async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    try {
        if (isLoginMode) await signInWithEmailAndPassword(auth, email, password);
        else await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) { alert(e.message); }
};
window.logout = () => signOut(auth).then(() => window.location.reload());

function updateAuthUI() {
    const t = translations[currentLang];
    document.getElementById('auth-title').innerText = isLoginMode ? t.auth_title : t.auth_title_signup;
    document.getElementById('auth-btn-text').innerText = isLoginMode ? t.auth_btn_login : t.auth_btn_signup;
    document.getElementById('terms-container').style.display = isLoginMode ? 'none' : 'block';
}

// --- SYNC LOGIC ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        // FLAG: Start Loading
        isLoadingData = true; 
        updateStatus('connecting');
        
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'cvContent');
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
            const data = snap.data();
            if (data.formData) loadUserDataIntoForm(data.formData);
            if (data.theme) {
                currentTheme = data.theme;
                window.applyColor(currentTheme.color);
                window.applyFont(currentTheme.font);
            }
            if (data.layout) {
                currentLayout = data.layout;
                document.getElementById('rng-fontsize').value = currentLayout.fontSize;
                document.getElementById('rng-sectiongap').value = currentLayout.sectionGap;
                window.updateLayout();
            }
            window.showView('editor-view');
        } else {
            window.showView('template-view');
        }
        
        // FLAG: Done Loading
        isLoadingData = false; 
        generateCVFromForm(false); // Update Preview without saving
        updateStatus('online');
    } else {
        window.showView('landing-view');
    }
});

// --- DYNAMIC FORMS ---
// Helper for new sections
window.addFormCertificate = (data = null) => {
    const container = document.getElementById('form-certificates-list');
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    const t = translations[currentLang];
    div.innerHTML = `
        <button class="remove-dynamic-btn" onclick="removeItemAndRefresh(this)">×</button>
        <div class="input-grid">
            <div class="input-group">
                <label>${t.lbl_cert_name}</label>
                <input type="text" class="form-input cert-name" value="${data ? data.name : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group">
                <label>${t.lbl_cert_issuer}</label>
                <input type="text" class="form-input cert-issuer" value="${data ? data.issuer : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group full-width">
                <label>${t.lbl_date}</label>
                <input type="text" class="form-input cert-date" value="${data ? data.date : ''}" oninput="generateCVFromForm()">
            </div>
        </div>`;
    container.appendChild(div);
    if (!data) generateCVFromForm();
};

window.addFormReference = (data = null) => {
    const container = document.getElementById('form-references-list');
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    const t = translations[currentLang];
    div.innerHTML = `
        <button class="remove-dynamic-btn" onclick="removeItemAndRefresh(this)">×</button>
        <div class="input-grid">
            <div class="input-group">
                <label>${t.lbl_ref_name}</label>
                <input type="text" class="form-input ref-name" value="${data ? data.name : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group">
                <label>${t.lbl_company}</label>
                <input type="text" class="form-input ref-company" value="${data ? data.company : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group">
                <label>${t.lbl_job_title}</label>
                <input type="text" class="form-input ref-position" value="${data ? data.position : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group">
                <label>${t.lbl_ref_phone}</label>
                <input type="text" class="form-input ref-phone" value="${data ? data.phone : ''}" oninput="generateCVFromForm()">
            </div>
        </div>`;
    container.appendChild(div);
    if (!data) generateCVFromForm();
};

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
                <input type="text" class="form-input job-title" value="${data ? data.title : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group">
                <label>${t.lbl_company}</label>
                <input type="text" class="form-input job-company" value="${data ? data.company : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group full-width">
                <label>${t.lbl_date}</label>
                <input type="text" class="form-input job-date" value="${data ? data.date : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group full-width">
                <label>${t.lbl_desc}</label>
                <textarea class="form-input job-desc" rows="3" oninput="generateCVFromForm()">${data ? data.desc : ''}</textarea>
            </div>
        </div>`;
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
                <input type="text" class="form-input edu-school" value="${data ? data.school : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group">
                <label>${t.lbl_degree}</label>
                <input type="text" class="form-input edu-degree" value="${data ? data.degree : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group full-width">
                <label>${t.lbl_date}</label>
                <input type="text" class="form-input edu-date" value="${data ? data.date : ''}" oninput="generateCVFromForm()">
            </div>
        </div>`;
    container.appendChild(div);
    if (!data) generateCVFromForm();
};

window.addFormCustomSection = (data = null) => {
    const container = document.getElementById('form-custom-list');
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.innerHTML = `
        <button class="remove-dynamic-btn" onclick="removeItemAndRefresh(this)">×</button>
        <div class="input-group" style="margin-bottom:10px;">
            <label>Başlık</label>
            <input type="text" class="form-input custom-title" value="${data ? data.title : ''}" oninput="generateCVFromForm()">
        </div>
        <div class="input-group full-width">
            <label>İçerik</label>
            <textarea class="form-input custom-content" rows="3" oninput="generateCVFromForm()">${data ? data.content : ''}</textarea>
        </div>`;
    container.appendChild(div);
    if (!data) generateCVFromForm();
};

window.removeItemAndRefresh = (btn) => {
    btn.parentElement.remove();
    generateCVFromForm();
};

// --- CORE GENERATION ---
window.generateCVFromForm = (triggerSave = true) => {
    // Collect Data
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
        certificates: [],
        references: [],
        customSections: []
    };

    // Helper to scrape dynamic lists
    document.querySelectorAll('#form-experiences-list .dynamic-item').forEach(i => 
        data.experiences.push({ title: i.querySelector('.job-title').value, company: i.querySelector('.job-company').value, date: i.querySelector('.job-date').value, desc: i.querySelector('.job-desc').value })
    );
    document.querySelectorAll('#form-education-list .dynamic-item').forEach(i => 
        data.education.push({ school: i.querySelector('.edu-school').value, degree: i.querySelector('.edu-degree').value, date: i.querySelector('.edu-date').value })
    );
    document.querySelectorAll('#form-certificates-list .dynamic-item').forEach(i => 
        data.certificates.push({ name: i.querySelector('.cert-name').value, issuer: i.querySelector('.cert-issuer').value, date: i.querySelector('.cert-date').value })
    );
    document.querySelectorAll('#form-references-list .dynamic-item').forEach(i => 
        data.references.push({ name: i.querySelector('.ref-name').value, company: i.querySelector('.ref-company').value, position: i.querySelector('.ref-position').value, phone: i.querySelector('.ref-phone').value })
    );
    document.querySelectorAll('#form-custom-list .dynamic-item').forEach(i => 
        data.customSections.push({ title: i.querySelector('.custom-title').value, content: i.querySelector('.custom-content').value })
    );

    // Build HTML
    const labels = {
        exp: currentLang === 'tr' ? 'İŞ DENEYİMİ' : 'EXPERIENCE',
        edu: currentLang === 'tr' ? 'EĞİTİM' : 'EDUCATION',
        cert: currentLang === 'tr' ? 'SERTİFİKALAR' : 'CERTIFICATES',
        ref: currentLang === 'tr' ? 'REFERANSLAR' : 'REFERENCES',
        prof: currentLang === 'tr' ? 'PROFİL' : 'PROFILE',
        birth: translations[currentLang].cv_label_birth,
        lic: translations[currentLang].cv_label_license
    };

    // Sections HTML
    const getSectionHTML = (title, content) => content ? `<div class="section"><div class="section-header"><span class="section-title">${title}</span></div>${content}</div>` : '';

    let expHtml = data.experiences.map(e => `
        <div class="entry">
            <div class="left-col">${e.date}</div>
            <div class="right-col"><h3>${e.title}, ${e.company}</h3><p>${e.desc.replace(/\n/g, '<br>')}</p></div>
        </div>`).join('');

    let eduHtml = data.education.map(e => `
        <div class="entry">
            <div class="left-col">${e.date}</div>
            <div class="right-col"><h3>${e.degree}</h3><p>${e.school}</p></div>
        </div>`).join('');

    let certHtml = data.certificates.map(c => `
        <div class="entry">
            <div class="left-col">${c.date}</div>
            <div class="right-col"><h3>${c.name}</h3><p>${c.issuer}</p></div>
        </div>`).join('');

    let refHtml = data.references.map(r => `
        <div class="entry">
            <div class="right-col" style="width:100%">
                <h3>${r.name}</h3>
                <p>${r.position} - ${r.company}</p>
                <p>Tel: ${r.phone}</p>
            </div>
        </div>`).join('');

    let customHtml = data.customSections.map(s => getSectionHTML(s.title, `<div class="entry"><div class="right-col"><p>${s.content.replace(/\n/g, '<br>')}</p></div></div>`)).join('');

    // Combine
    let finalHtml = `
        <header>
            <h1>${data.fullname || 'AD SOYAD'}</h1>
            <div class="subtitle">${data.title}</div>
            <div class="contact-info">
                ${data.address ? `<span>📍 ${data.address}</span> |` : ''} 
                ${data.phone ? `<span>📞 ${data.phone}</span> |` : ''} 
                ${data.email ? `<span>✉️ ${data.email}</span>` : ''}
            </div>
        </header>
        <div id="main-content">
            ${data.summary ? getSectionHTML(labels.prof, `<div class="entry"><div class="right-col">${data.summary}</div></div>`) : ''}
            ${expHtml ? getSectionHTML(labels.exp, expHtml) : ''}
            ${eduHtml ? getSectionHTML(labels.edu, eduHtml) : ''}
            ${certHtml ? getSectionHTML(labels.cert, certHtml) : ''}
            ${refHtml ? getSectionHTML(labels.ref, refHtml) : ''}
            ${customHtml}
        </div>
    `;

    document.getElementById('cv-root').innerHTML = finalHtml;
    
    if(window.innerWidth <= 1024) setTimeout(window.resizePreview, 10);

    // Autosave check
    if (triggerSave && !isLoadingData) triggerDebounceSave(data);
};

// --- DATA LOADING HELPERS ---
function loadUserDataIntoForm(data) {
    document.getElementById('inp-fullname').value = data.fullname || '';
    document.getElementById('inp-title').value = data.title || '';
    document.getElementById('inp-email').value = data.email || '';
    document.getElementById('inp-phone').value = data.phone || '';
    document.getElementById('inp-address').value = data.address || '';
    document.getElementById('inp-birthplace').value = data.birthplace || '';
    document.getElementById('inp-license').value = data.license || '';
    document.getElementById('inp-summary').value = data.summary || '';

    // Clear lists
    ['experiences', 'education', 'certificates', 'references', 'custom'].forEach(t => 
        document.getElementById(`form-${t}-list`).innerHTML = ''
    );

    if(data.experiences) data.experiences.forEach(d => addFormExperience(d));
    if(data.education) data.education.forEach(d => addFormEducation(d));
    if(data.certificates) data.certificates.forEach(d => addFormCertificate(d));
    if(data.references) data.references.forEach(d => addFormReference(d));
    if(data.customSections) data.customSections.forEach(d => addFormCustomSection(d));
}

function triggerDebounceSave(data) {
    if (saveTimeout) clearTimeout(saveTimeout);
    updateStatus('syncing');
    saveTimeout = setTimeout(() => saveToCloud(data), 2000);
}

async function saveToCloud(formData = null) {
    if (!currentUser || isLoadingData) return; // Prevent saving empty data on load
    
    isSyncing = true;
    const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'data', 'cvContent');
    
    try {
        await setDoc(docRef, { 
            formData: formData, 
            template: document.body.className,
            theme: currentTheme,
            layout: currentLayout,
            updatedAt: new Date().toISOString() 
        }, { merge: true });
        
        updateStatus('online');
    } catch (e) { 
        console.error(e);
        updateStatus('error');
    } finally {
        isSyncing = false;
    }
}

function updateStatus(state) {
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    if (!dot) return;
    const t = translations[currentLang];
    
    if (state === 'online') {
        dot.className = 'status-dot status-online';
        text.innerText = t.status_online;
    } else if (state === 'syncing') {
        dot.className = 'status-dot status-syncing';
        text.innerText = t.status_syncing;
    } else if (state === 'connecting') {
        dot.className = 'status-dot status-syncing'; // Yellow
        text.innerText = t.status_connecting;
    } else {
        dot.className = 'status-dot';
        text.innerText = t.status_offline;
    }
}

window.selectTemplate = (tpl) => {
    document.body.className = tpl;
    window.showView('editor-view');
    generateCVFromForm();
};

window.backToTemplates = () => {
    saveToCloud(); 
    window.showView('template-view');
};

window.resetAll = async () => {
    if(!confirm('Reset?')) return;
    ['inp-fullname','inp-title','inp-email','inp-phone','inp-address','inp-summary'].forEach(id=>document.getElementById(id).value='');
    ['experiences','education','certificates','references','custom'].forEach(t => document.getElementById(`form-${t}-list`).innerHTML = '');
    generateCVFromForm();
};
