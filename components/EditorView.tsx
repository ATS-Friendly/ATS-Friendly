import React, { useState, useEffect, useRef, useCallback } from 'react';

// Helper to generate unique IDs
const generateId = () => `id_${new Date().getTime()}_${Math.random()}`;

const initialFormData = {
  fullname: "Adınız Soyadınız",
  title: "Unvanınız",
  email: "email@adresiniz.com",
  phone: "555-123-4567",
  address: "Şehir, Ülke",
  birthplace: "",
  license: "",
  summary: "Kariyer hedeflerinizi ve becerilerinizi özetleyen kısa bir bölüm.",
  experiences: [],
  education: [],
  customSections: [],
};

const initialCvDoc = {
  formData: initialFormData,
  template: 'tpl-classic',
  theme: { color: '#2c3e50', font: 'ptserif' },
  layout: { fontSize: 11, lineHeight: 1.4, margin: 20, sectionGap: 15 },
};


const CVPreview = ({ cvData, cvRootRef }) => {
    const { formData, template } = cvData;
    const isCompact = template === 'tpl-compact';
    const accentStyle = { color: cvData.theme.color };
    const borderStyle = { borderColor: cvData.theme.color };

    return (
        <div ref={cvRootRef} className="p-[20mm] bg-white w-[210mm] min-h-[297mm] cv-preview-font text-black" style={{
            fontSize: `${cvData.layout.fontSize}pt`,
            lineHeight: cvData.layout.lineHeight,
        }}>
            <header className="pb-6 mb-8 text-center" style={{...borderStyle, borderBottomWidth: '2px'}}>
                <h1 className="text-4xl font-bold tracking-widest uppercase" style={accentStyle}>{formData.fullname || 'Ad Soyad'}</h1>
                <p className="text-lg">{formData.title || 'Unvan'}</p>
                {!isCompact && (
                    <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600">
                        <span>📍 {formData.address}</span>
                        <span>📞 {formData.phone}</span>
                        <span>✉️ {formData.email}</span>
                    </div>
                )}
                 {isCompact && (
                    <div className="mt-4 text-sm">
                        <p>{formData.address}</p>
                        <div className="flex justify-center gap-4 font-semibold" style={accentStyle}>
                            <span>{formData.phone}</span>
                            <span>{formData.email}</span>
                        </div>
                    </div>
                )}
            </header>
            <main className="space-y-6">
                <section>
                    <h2 className="pb-2 mb-4 text-sm font-bold tracking-widest uppercase border-b-2" style={{...borderStyle, ...accentStyle}}>Profil</h2>
                    <p className="text-gray-700">{formData.summary}</p>
                </section>
                {formData.experiences.length > 0 && <section>
                    <h2 className="pb-2 mb-4 text-sm font-bold tracking-widest uppercase border-b-2" style={{...borderStyle, ...accentStyle}}>İş Deneyimi</h2>
                    <div className="space-y-4">
                        {formData.experiences.map(exp => (
                            <div key={exp.id} className="grid grid-cols-4 gap-4">
                                <div className="text-xs font-bold text-gray-600 col-span-1">{exp.date}</div>
                                <div className="col-span-3">
                                    <h3 className="font-bold">{exp.title}, <span className="font-normal text-gray-800">{exp.company}</span></h3>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{exp.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>}
                {formData.education.length > 0 && <section>
                    <h2 className="pb-2 mb-4 text-sm font-bold tracking-widest uppercase border-b-2" style={{...borderStyle, ...accentStyle}}>Eğitim</h2>
                    <div className="space-y-4">
                        {formData.education.map(edu => (
                            <div key={edu.id} className="grid grid-cols-4 gap-4">
                                <div className="text-xs font-bold text-gray-600 col-span-1">{edu.date}</div>
                                <div className="col-span-3">
                                    <h3 className="font-bold">{edu.degree}</h3>
                                    <p className="text-sm text-gray-700">{edu.school}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>}
                {formData.customSections.map(sec => (
                    <section key={sec.id}>
                        <h2 className="pb-2 mb-4 text-sm font-bold tracking-widest uppercase border-b-2" style={{...borderStyle, ...accentStyle}}>{sec.title}</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{sec.content}</p>
                    </section>
                ))}
            </main>
        </div>
    );
};

const EditorView = ({ user, setView }) => {
    // Globals accessed here safely
    const { getCvDocument, saveCvDocument, logout } = (window as any).FirebaseService;
    const TemplateView = (window as any).TemplateView;

    const [cvData, setCvData] = useState(null);
    const [mobileTab, setMobileTab] = useState('edit');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    const cvScaleContainerRef = useRef(null);
    const cvRootRef = useRef(null);
    const debounceTimeoutRef = useRef(null);

    const debouncedSave = useCallback((data) => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = window.setTimeout(() => {
            saveCvDocument(user.uid, data);
        }, 1500);
    }, [user.uid, saveCvDocument]);

    useEffect(() => {
        const fetchCvData = async () => {
            const doc = await getCvDocument(user.uid);
            if (doc) {
                setCvData(doc);
            } else {
                setCvData(null); 
            }
        };
        fetchCvData();
    }, [user.uid, getCvDocument]);
    
    const updateCvData = (updates) => {
        setCvData(prevData => {
            if (!prevData) return null;
            const newPartialData = typeof updates === 'function' ? updates(prevData) : updates;
            const newData = { ...prevData, ...newPartialData };
            debouncedSave(newData);
            return newData;
        });
    };

    const updateFormData = (updates) => {
        updateCvData(prev => {
            const newPartialForm = typeof updates === 'function' ? updates(prev.formData) : updates;
            return { formData: { ...prev.formData, ...newPartialForm } };
        });
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const resizePreview = () => {
            const scaleContainer = cvScaleContainerRef.current;
            const cvRoot = cvRootRef.current;

            if (!scaleContainer || !cvRoot) return;

            if (!isMobile) {
                cvRoot.style.transform = 'scale(1)';
                scaleContainer.style.width = 'auto';
                scaleContainer.style.height = 'auto';
                return;
            }

            const originalWidth = 794; 
            const availableWidth = window.innerWidth - 20;
            const scale = Math.min(1, availableWidth / originalWidth);

            cvRoot.style.transformOrigin = 'top center';
            cvRoot.style.transform = `scale(${scale})`;
            
            const scaledWidth = originalWidth * scale;
            const scaledHeight = cvRoot.scrollHeight * scale;

            scaleContainer.style.width = `${scaledWidth}px`;
            scaleContainer.style.height = `${scaledHeight}px`;
        };

        if (isMobile && mobileTab === 'preview') {
            setTimeout(resizePreview, 50);
        } else {
            resizePreview();
        }

        window.addEventListener('resize', resizePreview);
        return () => window.removeEventListener('resize', resizePreview);
    }, [isMobile, mobileTab, cvData]);


    if (cvData === null) {
        return <TemplateView onSelectTemplate={(template) => {
            const newData = { ...initialCvDoc, template };
            setCvData(newData);
            saveCvDocument(user.uid, newData);
        }} />;
    }

    const { formData } = cvData;

    return (
        <div className="flex w-screen h-screen overflow-hidden">
            <aside className="hidden lg:flex flex-col w-64 bg-gray-800 text-white">
                <div className="p-4 border-b border-gray-700">
                    <h1 className="text-xl font-bold">ATS-Friendly</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => window.print()} className="w-full px-3 py-2 text-left rounded hover:bg-gray-700">🖨️ PDF İndir</button>
                    <button onClick={logout} className="w-full px-3 py-2 text-left rounded hover:bg-gray-700">🚪 Çıkış Yap</button>
                </nav>
            </aside>
            
            <div className="flex-1 flex flex-col h-screen">
                <div className="flex-1 lg:grid lg:grid-cols-2 overflow-hidden">
                    <div className={`p-6 overflow-y-auto bg-white ${isMobile && mobileTab !== 'edit' ? 'hidden' : 'block'}`}>
                        <h2 className="text-xl font-bold mb-6">Bilgilerinizi Düzenleyin</h2>
                        <div className="mb-6">
                            <h3 className="font-bold text-blue-600 mb-2">Kişisel Bilgiler</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input value={formData.fullname} onChange={e => updateFormData({ fullname: e.target.value })} placeholder="Ad Soyad" className="p-2 border rounded"/>
                                <input value={formData.title} onChange={e => updateFormData({ title: e.target.value })} placeholder="Unvan" className="p-2 border rounded"/>
                                <input type="email" value={formData.email} onChange={e => updateFormData({ email: e.target.value })} placeholder="E-posta" className="p-2 border rounded"/>
                                <input value={formData.phone} onChange={e => updateFormData({ phone: e.target.value })} placeholder="Telefon" className="p-2 border rounded"/>
                                <input value={formData.address} onChange={e => updateFormData({ address: e.target.value })} placeholder="Adres" className="p-2 border rounded sm:col-span-2"/>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-bold text-blue-600 mb-2">Profil Özeti</h3>
                            <textarea value={formData.summary} onChange={e => updateFormData({ summary: e.target.value })} placeholder="Kısa özet..." rows={4} className="w-full p-2 border rounded"></textarea>
                        </div>
                        
                        <div className="mb-6">
                            <h3 className="font-bold text-blue-600 mb-2">İş Deneyimi</h3>
                            {formData.experiences.map((exp, index) => (
                                <div key={exp.id} className="p-4 mb-2 bg-gray-50 border rounded-lg space-y-2">
                                    <input value={exp.title} onChange={e => updateFormData(p => ({ experiences: p.experiences.map((i, idx) => idx === index ? {...i, title: e.target.value} : i) }))} placeholder="Pozisyon" className="w-full p-2 border rounded"/>
                                    <input value={exp.company} onChange={e => updateFormData(p => ({ experiences: p.experiences.map((i, idx) => idx === index ? {...i, company: e.target.value} : i) }))} placeholder="Şirket" className="w-full p-2 border rounded"/>
                                    <input value={exp.date} onChange={e => updateFormData(p => ({ experiences: p.experiences.map((i, idx) => idx === index ? {...i, date: e.target.value} : i) }))} placeholder="Tarih (örn: Oca 2020 - Halen)" className="w-full p-2 border rounded"/>
                                    <textarea value={exp.desc} onChange={e => updateFormData(p => ({ experiences: p.experiences.map((i, idx) => idx === index ? {...i, desc: e.target.value} : i) }))} placeholder="Açıklama" rows={3} className="w-full p-2 border rounded"></textarea>
                                    <button onClick={() => updateFormData(p => ({ experiences: p.experiences.filter(i => i.id !== exp.id) }))} className="text-red-500 text-sm">Deneyimi Sil</button>
                                </div>
                            ))}
                            <button onClick={() => updateFormData(p => ({ experiences: [...p.experiences, {id: generateId(), title: '', company: '', date: '', desc: ''}] }))} className="w-full p-2 mt-2 text-blue-600 border-2 border-dashed border-blue-300 rounded hover:bg-blue-50">+ İş Ekle</button>
                        </div>
                    </div>

                    <div className={`flex justify-center items-start p-4 lg:p-8 overflow-auto bg-gray-200 ${isMobile && mobileTab !== 'preview' ? 'hidden' : 'flex'}`}>
                        <div ref={cvScaleContainerRef} className="print-area">
                           <CVPreview cvData={cvData} cvRootRef={cvRootRef} />
                        </div>
                    </div>
                </div>

                {isMobile && (
                    <div className="flex items-center bg-white border-t border-gray-200 shadow-inner h-16">
                        <button onClick={() => setMobileTab('edit')} className={`flex-1 flex flex-col items-center justify-center h-full text-xs font-bold ${mobileTab === 'edit' ? 'text-blue-600' : 'text-gray-500'}`}>
                            <span className="text-2xl">✏️</span>
                            Düzenle
                        </button>
                        <button onClick={() => setMobileTab('preview')} className={`flex-1 flex flex-col items-center justify-center h-full text-xs font-bold ${mobileTab === 'preview' ? 'text-blue-600' : 'text-gray-500'}`}>
                            <span className="text-2xl">👁️</span>
                            Önizle
                        </button>
                        <button onClick={() => window.print()} className="flex-1 flex flex-col items-center justify-center h-full text-xs font-bold text-gray-500">
                             <span className="text-2xl">🖨️</span>
                            İndir
                        </button>
                        <button onClick={logout} className="flex-1 flex flex-col items-center justify-center h-full text-xs font-bold text-gray-500">
                             <span className="text-2xl">🚪</span>
                            Çıkış
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

(window as any).EditorView = EditorView;