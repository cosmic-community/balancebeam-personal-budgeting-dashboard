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
        // Primary brand colors
        accent: '#3B82F6',
        'accent-hover': '#2563EB',
        
        // Background colors
        'background-light': '#F8FAFC',
        'background-dark': '#0F172A',
        
        // Surface colors (cards, modals, etc.)
        'surface-light': '#FFFFFF',
        'surface-dark': '#1E293B',
        
        // Card colors
        'card-light': '#FFFFFF',
        'card-dark': '#1E293B',
        
        // Text colors
        'text-primary-light': '#0F172A',
        'text-primary-dark': '#F8FAFC',
        'text-secondary-light': '#64748B',
        'text-secondary-dark': '#94A3B8',
        
        // Border colors
        'border-light': '#E2E8F0',
        'border-dark': '#334155',
        
        // Status colors
        success: '#10B981',
        'success-dark': '#059669',
        error: '#EF4444',
        'error-dark': '#DC2626',
        warning: '#F59E0B',
        'warning-dark': '#D97706',
        info: '#3B82F6',
        'info-dark': '#2563EB',
        
        // Income/Expense colors
        income: '#10B981',
        expense: '#EF4444',
        
        // Navigation pill colors
        'nav-pill-active-bg-light': '#EFF6FF',
        'nav-pill-active-bg-dark': '#1E3A8A',
        'nav-pill-active-text-light': '#1D4ED8',
        'nav-pill-active-text-dark': '#93C5FD',
        'nav-pill-inactive-text-light': '#6B7280',
        'nav-pill-inactive-text-dark': '#9CA3AF'
      },
      spacing: {
        'grid-gap': '1.5rem'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}