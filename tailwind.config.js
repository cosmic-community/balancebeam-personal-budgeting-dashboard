/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand colors - warm neutral palette
        accent: '#F5C84C',
        'accent-hover': '#E6B843',
        
        // Background colors - warm neutral
        'background-light': '#FAF7F2',
        'background-dark': '#1A1A1A',
        
        // Surface colors (cards, modals, etc.)
        'surface-light': '#F3EDE6',
        'surface-dark': '#2A2A2A',
        
        // Card colors
        'card-light': '#F3EDE6',
        'card-dark': '#2A2A2A',
        
        // Text colors
        'text-primary-light': '#2F2F2F',
        'text-primary-dark': '#F8F8F8',
        'text-secondary-light': '#6A6A6A',
        'text-secondary-dark': '#A0A0A0',
        
        // Border colors
        'border-light': '#E0D9D2',
        'border-dark': '#404040',
        
        // Status colors
        success: '#4CAF50',
        'success-dark': '#45A049',
        error: '#E74C3C',
        'error-dark': '#C0392B',
        warning: '#F5C84C',
        'warning-dark': '#E6B843',
        info: '#3498DB',
        'info-dark': '#2980B9',
        
        // Income/Expense colors
        income: '#4CAF50',
        expense: '#E74C3C',
        
        // Navigation pill colors
        'nav-pill-active-bg-light': '#F5C84C',
        'nav-pill-active-bg-dark': '#E6B843',
        'nav-pill-active-text-light': '#2F2F2F',
        'nav-pill-active-text-dark': '#1A1A1A',
        'nav-pill-inactive-text-light': '#6A6A6A',
        'nav-pill-inactive-text-dark': '#A0A0A0'
      },
      spacing: {
        'grid-gap': '20px',
        'card-padding': '24px'
      },
      borderRadius: {
        'card': '16px',
        'pill': '24px'
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      fontSize: {
        'heading': ['24px', { lineHeight: '1.2', fontWeight: '500' }],
        'subheading': ['18px', { lineHeight: '1.3', fontWeight: '500' }],
        'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-lg': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'numbers': ['20px', { lineHeight: '1.2', fontWeight: '700' }],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}