import React from 'react';

export const DocReaderLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="20" fill="url(#logo-gradient)" />
    <defs>
      <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    <path d="M12 28L12 8H28V28C28 29.1 27.1 30 26 30H14C12.9 30 12 29.1 12 28Z" fill="white" stroke="#7C3AED" strokeWidth="1" />
    <path d="M16 24H24V26H16V24Z" fill="#7C3AED" />
  </svg>
);