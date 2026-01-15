
import React from 'react';
import ReactDOM from 'react-dom/client';

declare global {
  interface Window {
    App: React.ComponentType;
  }
}

console.log("🚀 Index.tsx starting...");

const mountApp = () => {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
        console.error("❌ Root element not found!");
        return;
    }

    // Check if App component is registered in window
    const App = window.App;
    
    if (App) {
        console.log("✅ App component found, mounting React...");
        const root = ReactDOM.createRoot(rootElement);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    } else {
        console.log("⏳ Waiting for App component to load...");
        // Retry shortly
        setTimeout(mountApp, 100);
    }
}

// Start the mounting process
mountApp();
