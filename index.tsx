import React from 'react';
import ReactDOM from 'react-dom/client';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Wait for App to be loaded via Babel script execution
const mountApp = () => {
    const App = (window as any).App;
    if (App) {
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    } else {
        // Retry shortly if App.tsx hasn't finished transpiling yet
        setTimeout(mountApp, 50);
    }
}

mountApp();