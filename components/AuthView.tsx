import React, { useState } from 'react';

declare global {
  interface Window {
    FirebaseService: any;
    AuthView: React.ComponentType<any>;
  }
}

const AuthView = ({ setView }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Access global service here
    const { handleEmailAuth } = window.FirebaseService;

    try {
      await handleEmailAuth(isLoginMode, email, password);
    } catch (err) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setError('');
    const { loginWithGoogle } = window.FirebaseService;
    
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google ile giriş yapılamadı.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <button onClick={() => setView('landing')} className="absolute text-sm font-semibold text-gray-600 top-5 left-5 hover:text-blue-600">
            ← Ana Sayfa
        </button>
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-2xl font-bold text-white bg-gray-800 rounded-lg">AF</div>
          <h2 className="text-2xl font-bold text-gray-800">{isLoginMode ? 'Hesabınıza Giriş Yapın' : 'Ücretsiz Hesap Oluşturun'}</h2>
          <p className="text-gray-500">{isLoginMode ? "CV'nizi düzenlemeye devam edin" : 'Kredi kartı gerekmez'}</p>
        </div>

        {error && <p className="mb-4 text-sm text-center text-red-500">{error}</p>}

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-bold text-gray-600" htmlFor="email">E-posta Adresi</label>
            <input 
                type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 leading-tight text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ornek@email.com" required 
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 text-sm font-bold text-gray-600" htmlFor="password">Şifre</label>
            <input 
                type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 leading-tight text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="••••••••" required 
            />
          </div>
          <button type="submit" disabled={loading} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300">
            {loading ? 'İşleniyor...' : (isLoginMode ? 'Giriş Yap' : 'Kayıt Ol')}
          </button>
        </form>

        <div className="my-6 text-center text-xs font-bold text-gray-400 uppercase">Veya</div>

        <button onClick={onGoogleLogin} className="flex items-center justify-center w-full gap-3 px-4 py-2 font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200">
            <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.305 0-13.782 3.914-17.694 9.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C10.111 38.971 16.51 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
            Google ile Devam Et
        </button>
        
        <p className="mt-6 text-sm text-center text-gray-600">
          {isLoginMode ? 'Hesabın yok mu? ' : 'Zaten hesabın var mı? '}
          <button onClick={() => setIsLoginMode(!isLoginMode)} className="font-bold text-blue-600 hover:underline">
            {isLoginMode ? 'Hemen Kayıt Ol' : 'Giriş Yap'}
          </button>
        </p>
      </div>
    </div>
  );
};

window.AuthView = AuthView;