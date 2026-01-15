
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebaseService';
import LandingView from './components/LandingView';
import AuthView from './components/AuthView';
import EditorView from './components/EditorView';

export type View = 'landing' | 'auth' | 'editor';

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setView('editor');
      } else {
        // If user logs out from editor, go to landing
        if (view === 'editor') {
          setView('landing');
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen bg-slate-100">
          <div className="text-xl font-semibold text-slate-600">Loading...</div>
        </div>
      );
    }

    switch (view) {
      case 'auth':
        return <AuthView setView={setView} />;
      case 'editor':
        if (currentUser) {
          return <EditorView user={currentUser} setView={setView} />;
        }
        // Fallback to auth if no user
        setView('auth');
        return <AuthView setView={setView} />;
      case 'landing':
      default:
        return <LandingView setView={setView} />;
    }
  };

  return <div className="min-h-screen bg-slate-100">{renderView()}</div>;
};

export default App;
