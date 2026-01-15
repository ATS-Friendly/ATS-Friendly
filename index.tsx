import React from 'react';
import ReactDOM from 'react-dom/client';

// App is loaded into window by App.tsx
const App = (window as any).App;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);