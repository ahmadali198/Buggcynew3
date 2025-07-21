import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { DarkModeProvider } from './context/Darkmodecontext';
import { BrowserRouter } from 'react-router-dom'; 

console.log("💡 Root rendering started...");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* Wrap your App with BrowserRouter */}
      <DarkModeProvider>
        <App />
      </DarkModeProvider>
    </BrowserRouter>
  </StrictMode>
);
