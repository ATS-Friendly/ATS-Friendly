import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

declare global {
  interface Window {
    FirebaseService: any;
    LandingView: React.ComponentType<any>;
    AuthView: React.ComponentType<any>;
    EditorView: React.ComponentType<any>;
    App: React.ComponentType;
  }
}

const App = () => {
  const [view, setView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servicesReady, setServicesReady] = useState(false);

  // Safely access globals inside effect/render
  useEffect(() => {
    const checkServices = () => {
      // Check if critical services and components are loaded
      if (
        window.FirebaseService && 
        window.LandingView && 
        window.AuthView && 
        window.EditorView
      ) {
        setServicesReady(true);
        const { auth } = window.FirebaseService;
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setCurrentUser(user);
          if (user) {
            setView('editor');
          } else if (view === 'editor') {
            setView('landing');
          }
          setLoading(false);
        });
        return unsubscribe;
      } else {
        // Retry shortly if not ready
        setTimeout(checkServices, 100);
      }
    };

    const cleanup = checkServices();
    return () => { if(typeof cleanup === 'function') cleanup(); };
  }, [view]);

  if (!servicesReady || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-xl font-semibold text-slate-600">
            {!servicesReady ? 'Yükleniyor...' : 'Oturum açılıyor...'}
        </div>
      </div>
    );
  }

  // Safe to access now
  const LandingView = window.LandingView;
  const AuthView = window.AuthView;
  const EditorView = window.EditorView;

  switch (view) {
    case 'auth':
      return <AuthView setView={setView} />;
    case 'editor':
      if (currentUser) {
        return <EditorView user={currentUser} setView={setView} />;
      }
      setView('auth');
      return <AuthView setView={setView} />;
    case 'landing':
    default:
      return <LandingView setView={setView} />;
  }
};

window.App = App;