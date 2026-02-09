import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './app/page';
import './app/globals.css';

// This file handles client-side mounting for environments that bypass Next.js routing
// (e.g. certain online code editors or static previews).
// In a standard Next.js app, this file is not used.

const container = document.getElementById('root') || document.body;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);