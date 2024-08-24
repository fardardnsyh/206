// import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';

// render app
ReactDOM.createRoot(document.getElementById('app')!).render(
  // <StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>
  // </StrictMode>
);

