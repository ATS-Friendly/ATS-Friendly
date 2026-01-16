
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

// --- SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log("SW Reg Error:", err));
    });
}

let isLoginMode = true;
let currentUser = null;
let isSyncing = false;
let saveTimeout = null; // For debouncing save
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
        auth_title: "Hesabınıza Giriş Yapın",
        auth_subtitle_login: "CV'nizi düzenlemeye devam edin",
        auth_title_signup: "Hemen Ücretsiz Hesap Oluşturun",
        auth_subtitle_signup: "Kredi kartı gerekmez",
        auth_btn_login: "Giriş Yap",
        auth_btn_signup: "Kayıt Ol",
        auth_toggle_msg_login: "Hesabın yok mu?",
        auth_toggle_link_login: "Hemen Kayıt Ol",
        auth_toggle_msg_signup: "Zaten hesabın var mı?",
        auth_toggle_link_signup: "Giriş Yap",
        
        auth_processing: "İşleniyor...",
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
        status_saved: "Kaydedildi!",
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
        btn_design: "Özelleştir",
        tab_edit: "Düzenle",
        tab_preview: "Önizle",
        landing_h1: "İşe Alım Robotlarını<br><span class='highlight-text'>Yenecek CV'nizi Oluşturun</span>",
        landing_subtitle: "Modern işe alım sistemleri (ATS) ile %100 uyumlu, profesyonel ve sade CV'ler hazırlayın. Üstelik tamamen ücretsiz.",
        btn_start_free: "Hemen Ücretsiz Başla",
        btn_how_it_works: "Nasıl Çalışır?",
        feat_1_title: "ATS Dostu Format",
        feat_1_desc: "Karmaşık grafikler yok. İnsan kaynakları yazılımlarının (ATS) kolayca okuyabileceği temiz kod yapısı.",
        feat_2_title: "%100 Ücretsiz",
        feat_2_desc: "Gizli ödeme yok, filigran yok. Sınırsız düzenleme ve PDF indirme hakkı.",
        feat_3_title: "Bulut Kayıt",
        feat_3_desc: "CV'niz bulutta güvende. İstediğiniz cihazdan (PC veya Mobil) kaldığınız yerden devam edin.",
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
        lbl_certificate_name: "Sertifika Adı",
        lbl_issuer: "Kurum / Yer",
        lbl_reference_name: "Referans Adı",
        lbl_reference_title: "Unvan / Şirket",
        lbl_reference_contact: "İletişim Bilgisi",
        lbl_section_title: "Bölüm Başlığı",
        lbl_section_content: "İçerik / Açıklama",
        form_certificates: "Sertifikalar",
        form_references: "Referanslar",
        btn_add_cert: "Sertifika Ekle",
        btn_add_ref: "Referans Ekle"
    },
    en: {
        auth_title: "Login to your account",
        auth_subtitle_login: "Continue editing your CV",
        auth_title_signup: "Create your free account",
        auth_subtitle_signup: "No credit card required",
        auth_btn_login: "Login",
        auth_btn_signup: "Sign Up",
        auth_toggle_msg_login: "Don't have an account?",
        auth_toggle_link_login: "Sign Up Now",
        auth_toggle_msg_signup: "Already have an account?",
        auth_toggle_link_signup: "Login",

        auth_processing: "Processing...",
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
        status_saved: "Saved!",
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
        btn_design: "Customize",
        tab_edit: "Edit",
        tab_preview: "Preview",
        landing_h1: "Build Your CV to<br><span class='highlight-text'>Beat Recruitment Robots</span>",
        landing_subtitle: "Create professional and simple CVs 100% compatible with modern recruitment systems (ATS). And it's completely free.",
        btn_start_free: "Start Free Now",
        btn_how_it_works: "How It Works?",
        feat_1_title: "ATS Friendly Format",
        feat_1_desc: "No complex graphics. Clean code structure that human resources software (ATS) can easily read.",
        feat_2_title: "100% Free",
        feat_2_desc: "No hidden payments, no watermarks. Unlimited editing and PDF download rights.",
        feat_3_title: "Cloud Save",
        feat_3_desc: "Your CV is safe in the cloud. Continue where you left off from any device (PC or Mobile).",
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
        lbl_certificate_name: "Certificate Name",
        lbl_issuer: "Issuer / Where",
        lbl_reference_name: "Reference Name",
        lbl_reference_title: "Title / Company",
        lbl_reference_contact: "Contact Info",
        lbl_section_title: "Section Title",
        lbl_section_content: "Content / Description",
        form_certificates: "Certificates",
        form_references: "References",
        btn_add_cert: "Add Certificate",
        btn_add_ref: "Add Reference"
    }
};

window.setLanguage = (lang) => {
    currentLang = lang;
    document.documentElement.lang = lang; // Set HTML lang attribute to fix text-transform issues
    
    // UI Güncelle
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = translations[lang][key];
        if (translation) {
            if (translation.includes('<')) {
                el.innerHTML = translation;
            } else {
                el.innerText = translation;
            }
        }
    });

    // Toggle Button Style
    document.querySelectorAll('[data-lang]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Update Auth Labels Manually
    updateAuthUI();
    
    // Refresh CV Preview to apply language changes (e.g. section headers)
    generateCVFromForm();
};

function updateAuthUI() {
    const t = translations[currentLang];
    const title = isLoginMode ? t.auth_title : t.auth_title_signup;
    const sub = isLoginMode ? t.auth_subtitle_login : t.auth_subtitle_signup;
    const btnText = isLoginMode ? t.auth_btn_login : t.auth_btn_signup;
    const toggleMsg = isLoginMode ? t.auth_toggle_msg_login : t.auth_toggle_msg_signup;
    const toggleLink = isLoginMode ? t.auth_toggle_link_login : t.auth_toggle_link_signup;

    document.getElementById('auth-title').innerText = title;
    document.getElementById('auth-subtitle').innerText = sub;
    document.getElementById('auth-btn-text').innerText = btnText;
    document.getElementById('auth-toggle-msg').innerText = toggleMsg;
    document.getElementById('auth-toggle-link').innerText = toggleLink;
    
    // Toggle Terms Checkbox visibility
    document.getElementById('terms-container').style.display = isLoginMode ? 'none' : 'block';
}

// --- EKRAN YÖNETİMİ ---
window.showView = (viewId) => {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
        // Default mobile tab
        if (viewId === 'editor-view' && window.innerWidth <= 1024) {
            window.switchMobileTab('edit');
        }
    }
};

window.switchMobileTab = (tab) => {
    const editorView = document.getElementById('editor-view');
    const tabEdit = document.getElementById('tab-edit');
    const tabPreview = document.getElementById('tab-preview');
    
    if (tab === 'edit') {
        editorView.classList.add('show-edit');
        editorView.classList.remove('show-preview');
        tabEdit.classList.add('active');
        tabPreview.classList.remove('active');
        // Scroll to top of form
        document.getElementById('panel-form').scrollTop = 0;
    } else {
        editorView.classList.add('show-preview');
        editorView.classList.remove('show-edit');
        tabPreview.classList.add('active');
        tabEdit.classList.remove('active');
        // Recalculate preview scale when switching to preview
        setTimeout(window.resizePreview, 50);
    }
};


// --- AUTO SCALE PREVIEW FOR MOBILE ---
window.resizePreview = () => {
    const previewPanel = document.getElementById('panel-preview');
    const scaleContainer = document.getElementById('cv-scale-container');
    const cvRoot = document.getElementById('cv-root');

    if (!previewPanel || !scaleContainer || !cvRoot) return;

    if (window.innerWidth > 1024) {
        // Desktop Reset
        cvRoot.style.transform = 'none';
        scaleContainer.style.width = 'auto';
        scaleContainer.style.height = 'auto';
        scaleContainer.style.marginTop = '0';
        scaleContainer.style.marginBottom = '0';
        return;
    }

    // --- NEW MOBILE LOGIC ---
    // 210mm @ 96dpi approx 794px wide.
    const originalWidth = 794; 
    
    // Calculate available width with padding
    const horizontalPadding = 30; 
    const availableWidth = window.innerWidth - horizontalPadding;

    // Calculate Scale Factor
    const scale = Math.min(1, availableWidth / originalWidth);
    
    // 1. Transform the INNER content (#cv-root)
    cvRoot.style.transformOrigin = 'top left'; 
    cvRoot.style.transform = `scale(${scale})`;
    cvRoot.style.width = originalWidth + 'px'; // Explicit width to prevent any flex/block shrinking
    
    // 2. Resize the OUTER wrapper (#cv-scale-container) to match the SCALED dimensions
    const scaledWidth = originalWidth * scale;
    const scaledHeight = cvRoot.getBoundingClientRect().height;

    scaleContainer.style.width = `${scaledWidth}px`;
    scaleContainer.style.height = `${scaledHeight}px`;
    
    // 3. Spacing
    scaleContainer.style.marginTop = '10px';
    scaleContainer.style.marginBottom = '100px'; 
    scaleContainer.style.marginLeft = '0';
    scaleContainer.style.marginRight = '0';
};

// Listen for window resize
window.addEventListener('resize', window.resizePreview);

// --- PRINT SCALING RESET ---
window.onbeforeprint = () => {
    const cvRoot = document.getElementById('cv-root');
    const scaleContainer = document.getElementById('cv-scale-container');
    if (cvRoot && scaleContainer) {
        cvRoot.style.transform = '';
        cvRoot.style.width = '';
        cvRoot.style.margin = '';
        scaleContainer.style.transform = '';
        scaleContainer.style.width = '';
        scaleContainer.style.height = '';
    }
};

window.onafterprint = () => {
    window.resizePreview();
};

// --- MOBILE FAB MENU ---
window.toggleFabMenu = () => {
    const items = document.getElementById('fab-items');
    const btn = document.getElementById('fab-trigger');
    const overlay = document.getElementById('fab-overlay');
    items.classList.toggle('show');
    btn.classList.toggle('active');
    overlay.classList.toggle('active');
};


// --- MODAL YÖNETİMİ (TEMA & LAYOUT) ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const content = modal.querySelector('.modal-content');
    modal.classList.add('active');
    
    // Close FAB when opening modal
    if (document.getElementById('fab-items')) {
        document.getElementById('fab-items').classList.remove('show');
        document.getElementById('fab-trigger').classList.remove('active');
        document.getElementById('fab-overlay').classList.remove('active');
    }

    // Center modal or simple fixed positioning for mobile stability
    if(window.innerWidth > 1024) {
        if (!content.style.top || !content.style.left) {
            content.style.top = "100px";
            const initialLeft = Math.max(20, window.innerWidth - 360);
            content.style.left = initialLeft + "px";
        }
        initDragElement(content);
    } else {
        // Mobile positioning handled by CSS (bottom sheet)
        content.style.top = '';
        content.style.left = '';
        content.style.transform = '';
    }
}

window.openThemeModal = () => openModal('theme-modal');
window.closeThemeModal = () => {
    document.getElementById('theme-modal').classList.remove('active');
    // Save happens via debounce or explicit change
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
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
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
    triggerDebounceSave(); // Save when color changes
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
    triggerDebounceSave(); // Save when font changes
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
    
    // Note: Layout changes are usually saved when modal closes, but we can debounce here too if desired
    // For performance, we wait for modal close or manual save
};

function applySavedLayout(layout) {
    if(!layout) return;
    currentLayout = layout;
    document.documentElement.style.setProperty('--cv-font-size', layout.fontSize + 'pt');
    document.documentElement.style.setProperty('--cv-line-height', layout.lineHeight);
    document.documentElement.style.setProperty('--cv-padding', layout.margin + 'mm');
    document.documentElement.style.setProperty('--cv-section-gap', layout.sectionGap + 'px');
}

// --- AUTH & LANDING LOGIC ---

window.scrollToFeatures = () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
};

window.showAuth = (loginMode) => {
    isLoginMode = loginMode;
    updateAuthUI();
    window.showView('auth-view');
};

window.loginWithGoogle = async () => {
    try {
        updateStatus('syncing'); 
        await signInWithPopup(auth, googleProvider);
    } catch (e) {
        let msg = "Google Giriş Hatası: " + e.message;
        if(e.code === 'auth/popup-blocked') {
            msg = "Tarayıcınız açılır pencereyi engelledi. Lütfen izin verin.";
        } else if (e.code === 'auth/popup-closed-by-user') {
            msg = "Giriş işlemi iptal edildi.";
        }
        alert(msg);
        updateStatus('error');
    }
};

window.toggleAuthMode = () => {
    isLoginMode = !isLoginMode;
    updateAuthUI();
};

window.handleAuth = async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const terms = document.getElementById('auth-terms').checked;
    const btnTextSpan = document.getElementById('auth-btn-text');
    const btn = document.querySelector('.auth-btn');
    
    if (!email || !password) return alert("Lütfen tüm alanları doldurun.");
    
    // Validate Terms on Signup
    if (!isLoginMode && !terms) {
        return alert("Kayıt olmak için Kullanım Koşulları ve Gizlilik Politikasını kabul etmelisiniz.");
    }

    const originalText = btnTextSpan.innerText;
    btnTextSpan.innerText = translations[currentLang].auth_processing;
    btn.disabled = true;

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
        }
        // Success is handled by onAuthStateChanged
    } catch (e) { 
        alert("Hata: " + e.message);
        btnTextSpan.innerText = originalText;
        btn.disabled = false;
    }
};

window.logout = () => signOut(auth).then(() => {
    localStorage.removeItem('monoCvData_v2');
    location.reload();
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Logged In
        currentUser = user;
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'cvContent');
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
            const data = snap.data();
            // Load saved data into form inputs
            if (data.formData) {
                loadUserDataIntoForm(data.formData);
            }

            if (data.sectionSettings) {
                const ss = data.sectionSettings;
                if (ss.titles) {
                    document.getElementById('title-certificates').value = ss.titles.certs || 'Sertifikalar';
                    document.getElementById('title-references').value = ss.titles.refs || 'Referanslar';
                }
                if (ss.visible) {
                    document.getElementById('form-certificates-block').style.display = ss.visible.certs ? 'block' : 'none';
                    document.getElementById('form-references-block').style.display = ss.visible.refs ? 'block' : 'none';
                    
                    document.getElementById('form-certificates-block').parentElement.style.opacity = ss.visible.certs ? '1' : '0.5';
                    document.getElementById('form-references-block').parentElement.style.opacity = ss.visible.refs ? '1' : '0.5';
                }
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
            
            window.showView('editor-view');
            generateCVFromForm(false); // Render CV, false = don't save immediately
            updateStatus('online');
        } else {
            window.showView('template-view');
        }
    } else {
        // Not Logged In - Show Landing Page by default unless manually navigated to Auth
        // If we are already on Auth view (e.g. failed login), stay there.
        // Otherwise, show Landing.
        const currentView = document.querySelector('.view-section.active');
        if (!currentView || currentView.id === 'editor-view' || currentView.id === 'template-view') {
            window.showView('landing-view');
        }
    }
});

// --- EDITOR LOGIC ---
window.selectTemplate = (tpl) => {
    document.body.className = tpl;
    window.showView('editor-view');
    generateCVFromForm();
};

window.backToTemplates = () => {
    saveToCloud(); 
    window.showView('template-view');
};

// --- DYNAMIC FORM HANDLERS ---
// All dynamic handlers now call generateCVFromForm() which will Debounce save
window.addFormExperience = (data = null) => {
    const container = document.getElementById('form-experiences-list');
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    const t = translations[currentLang];
    
    div.innerHTML = `
        <button class="remove-dynamic-btn" onclick="removeItemAndRefresh(this)" aria-label="Remove item">×</button>
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
        <button class="remove-dynamic-btn" onclick="removeItemAndRefresh(this)" aria-label="Remove item">×</button>
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
        <button class="remove-dynamic-btn" onclick="removeItemAndRefresh(this)" aria-label="Remove item">×</button>
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

window.addFormReference = (data = null) => {
    const container = document.getElementById('form-references-list');
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    const t = translations[currentLang];
    
    div.innerHTML = `
        <button class="remove-dynamic-btn" onclick="removeItemAndRefresh(this)" aria-label="Remove item">×</button>
        <div class="input-grid">
            <div class="input-group">
                <label>${t.lbl_reference_name}</label>
                <input type="text" class="form-input ref-name" placeholder="Ex: John Doe" value="${data ? data.name : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group">
                <label>${t.lbl_reference_title}</label>
                <input type="text" class="form-input ref-title" placeholder="Ex: HR Manager" value="${data ? data.title : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group full-width">
                <label>${t.lbl_reference_contact}</label>
                <input type="text" class="form-input ref-contact" placeholder="Ex: john@company.com" value="${data ? data.contact : ''}" oninput="generateCVFromForm()">
            </div>
        </div>
    `;
    container.appendChild(div);
    if (!data) generateCVFromForm();
};

window.addFormCertificate = (data = null) => {
    const container = document.getElementById('form-certificates-list');
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    const t = translations[currentLang];
    
    div.innerHTML = `
        <button class="remove-dynamic-btn" onclick="removeItemAndRefresh(this)" aria-label="Remove item">×</button>
        <div class="input-grid">
            <div class="input-group">
                <label>${t.lbl_certificate_name}</label>
                <input type="text" class="form-input cert-name" placeholder="Ex: PMP" value="${data ? data.name : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group">
                <label>${t.lbl_issuer}</label>
                <input type="text" class="form-input cert-issuer" placeholder="Ex: PMI" value="${data ? data.issuer : ''}" oninput="generateCVFromForm()">
            </div>
            <div class="input-group full-width">
                <label>${t.lbl_date}</label>
                <input type="text" class="form-input cert-date" placeholder="Ex: 2023" value="${data ? data.date : ''}" oninput="generateCVFromForm()">
            </div>
        </div>
    `;
    container.appendChild(div);
    if (!data) generateCVFromForm();
};

window.toggleSection = (id) => {
    const block = document.getElementById(id);
    const parent = block.parentElement;
    if (block.style.display === 'none') {
        block.style.display = 'block';
        parent.style.opacity = '1';
    } else {
        block.style.display = 'none';
        parent.style.opacity = '0.5';
    }
    generateCVFromForm();
};

window.removeItemAndRefresh = (btn) => {
    btn.parentElement.remove();
    generateCVFromForm();
};

// --- DATA BINDING ---
window.generateCVFromForm = (triggerSave = true) => {
    // 1. Gather Data from DOM Inputs
    const data = {
        fullname: document.getElementById('inp-fullname').value,
        title: document.getElementById('inp-title').value,
        email: document.getElementById('inp-email').value,
        phone: document.getElementById('inp-phone').value,
        address: document.getElementById('inp-address').value,
        license: document.getElementById('inp-license').value,
        summary: document.getElementById('inp-summary').value,
        experiences: [],
        education: [],
        certificates: [],
        references: [],
        customSections: []
    };

    // Collect Dynamic Lists
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

    document.querySelectorAll('#form-certificates-list .dynamic-item').forEach(item => {
        data.certificates.push({
            name: item.querySelector('.cert-name').value,
            issuer: item.querySelector('.cert-issuer').value,
            date: item.querySelector('.cert-date').value
        });
    });

    document.querySelectorAll('#form-references-list .dynamic-item').forEach(item => {
        data.references.push({
            name: item.querySelector('.ref-name').value,
            title: item.querySelector('.ref-title').value,
            contact: item.querySelector('.ref-contact').value
        });
    });

    document.querySelectorAll('#form-custom-list .dynamic-item').forEach(item => {
        data.customSections.push({
            title: item.querySelector('.custom-title').value,
            content: item.querySelector('.custom-content').value
        });
    });

    // Section Titles (Editable)
    const titles = {
        certs: document.getElementById('title-certificates').value,
        refs: document.getElementById('title-references').value
    };

    // Visible Status
    const visible = {
        certs: document.getElementById('form-certificates-block').style.display !== 'none',
        refs: document.getElementById('form-references-block').style.display !== 'none'
    };

    // 2. Generate HTML
    const isCompact = document.body.classList.contains('tpl-compact');
    let html = "";
    
    // Labels based on Lang
    const labels = {
        exp: currentLang === 'tr' ? 'İŞ DENEYİMİ' : 'EMPLOYMENT HISTORY',
        edu: currentLang === 'tr' ? 'EĞİTİM' : 'EDUCATION',
        prof: currentLang === 'tr' ? 'ÖZET' : 'SUMMARY',
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

    // -- CERTIFICATES (Restored / Optimized) --
    let certContent = "";
    if (visible.certs && data.certificates.length > 0) {
        let entries = data.certificates.map(cert => `
            <div class="entry">
                <div class="left-col">${cert.date}</div>
                <div class="right-col"><h3>${cert.name}</h3><p>${cert.issuer}</p></div>
            </div>`).join('');
        certContent = `<div class="section"><div class="section-header"><span class="section-title">${titles.certs}</span></div>${entries}</div>`;
    }

    // -- REFERENCES (Restored / Optimized) --
    let refContent = "";
    if (visible.refs && data.references.length > 0) {
        let entries = data.references.map(ref => `
            <div class="entry">
                <div class="right-col"><h3>${ref.name}</h3><p>${ref.title} | ${ref.contact}</p></div>
            </div>`).join('');
        refContent = `<div class="section"><div class="section-header"><span class="section-title">${titles.refs}</span></div>${entries}</div>`;
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
            ${certContent}
            ${refContent}
            ${customContent}
        </div>`;
    } else if (document.body.classList.contains('tpl-elegant')) {
        html = `
        <header>
            <h1>${data.fullname || 'ADINIZ SOYADINIZ'}</h1>
            <div class="subtitle">${data.title}</div>
            <div class="contact-info">
                <span>✉️ ${data.email}</span> | <span>📞 ${data.phone}</span> | <span>📍 ${data.address}</span>
            </div>
        </header>
        <div id="main-content">
             <div class="section">
                <div class="section-header"><span class="section-title">${labels.prof}</span></div>
                <div class="entry"><div class="right-col">${data.summary}</div></div>
            </div>
            ${expContent}
            ${eduContent}
            ${certContent}
            ${refContent}
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
            ${certContent}
            ${refContent}
            ${customContent}
        </div>`;
    }

    document.getElementById('cv-root').innerHTML = html;
    
    // Trigger scale update if on mobile preview
    if(window.innerWidth <= 1024) {
        setTimeout(window.resizePreview, 10);
    }

    // Trigger Debounce Save
    if (triggerSave) {
        triggerDebounceSave(data);
    }
};

function loadUserDataIntoForm(data) {
    document.getElementById('inp-fullname').value = data.fullname || '';
    document.getElementById('inp-title').value = data.title || '';
    document.getElementById('inp-email').value = data.email || '';
    document.getElementById('inp-phone').value = data.phone || '';
    document.getElementById('inp-address').value = data.address || '';
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

    const certList = document.getElementById('form-certificates-list');
    certList.innerHTML = '';
    if (data.certificates) {
        data.certificates.forEach(cert => addFormCertificate(cert));
    }

    const refList = document.getElementById('form-references-list');
    refList.innerHTML = '';
    if (data.references) {
        data.references.forEach(ref => addFormReference(ref));
    }

    const customList = document.getElementById('form-custom-list');
    customList.innerHTML = '';
    if (data.customSections) {
        data.customSections.forEach(sec => addFormCustomSection(sec));
    }
}


// --- DEBOUNCE SAVE ---
function triggerDebounceSave(data = null) {
    // Clear existing timer
    if (saveTimeout) clearTimeout(saveTimeout);
    
    updateStatus('syncing');

    // Set new timer for 2 seconds
    saveTimeout = setTimeout(() => {
        saveToCloud(data);
    }, 2000);
}


// --- SAVE / LOAD ---
async function saveToCloud(formData = null) {
    if (!currentUser) return;
    
    // If saving explicitly without formData (e.g. template change), assume it's a direct state save
    // But better to grab current form data if null to be safe, 
    // though `generateCVFromForm` usually passes it.
    
    isSyncing = true;
    
    const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'data', 'cvContent');
    
    // Gather Section Settings
    const sectionSettings = {
        titles: {
            certs: document.getElementById('title-certificates').value,
            refs: document.getElementById('title-references').value
        },
        visible: {
            certs: document.getElementById('form-certificates-block').style.display !== 'none',
            refs: document.getElementById('form-references-block').style.display !== 'none'
        }
    };

    try {
        await setDoc(docRef, { 
            formData: formData, 
            sectionSettings: sectionSettings,
            template: document.body.className,
            theme: currentTheme,
            layout: currentLayout,
            updatedAt: new Date().toISOString() 
        }, { merge: true });
        
        updateStatus('online');
        
        // Only show toast AFTER successful save
        const t = document.getElementById('toast');
        t.innerText = translations[currentLang].status_saved;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2000);

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

// --- RESET ---
window.resetAll = async (skipConfirm = false) => {
    if(!skipConfirm && !confirm(translations[currentLang].confirm_reset)) return;
    
    // Clear Form Inputs
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(i => i.value = '');
    document.getElementById('form-experiences-list').innerHTML = '';
    document.getElementById('form-education-list').innerHTML = '';
    document.getElementById('form-certificates-list').innerHTML = '';
    document.getElementById('form-references-list').innerHTML = '';
    document.getElementById('form-custom-list').innerHTML = '';
    
    document.getElementById('title-certificates').value = translations[currentLang].form_certificates;
    document.getElementById('title-references').value = translations[currentLang].form_references;
    
    document.getElementById('form-certificates-block').style.display = 'block';
    document.getElementById('form-references-block').style.display = 'block';
    document.getElementById('form-certificates-block').parentElement.style.opacity = '1';
    document.getElementById('form-references-block').parentElement.style.opacity = '1';
    
    generateCVFromForm();
    if(!skipConfirm) {
        const t = document.getElementById('toast');
        t.innerText = translations[currentLang].toast_reset;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    }
};

window.createNewSection = () => {
    alert("Yeni sistemde 'Özel Bölümler' alanını kullanarak ekleme yapabilirsiniz.");
};

// Initial setup
setLanguage('tr');
window.resizePreview();