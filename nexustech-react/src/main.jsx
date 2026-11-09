import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/styles.css';
import './styles/catalog.css';
import './styles/departments.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
