import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Root from './root.jsx';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => {
        console.log('Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  // removed strict mode, was hooking animate() twice.
  <Root />
);
