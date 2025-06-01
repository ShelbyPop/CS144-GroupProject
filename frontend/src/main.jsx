import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Root from './root.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  // removed strict mode, was hooking animate() twice.
  <Root />
);
