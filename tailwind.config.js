/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#FAF7F2',
          dark: '#1F1F23'
        },
        card: {
          light: '#F3EDE6',
          dark: '#2A2A2E'
        },
        accent: '#F5C84C',
        text: {
          primary: {
            light: '#2F2F2F',
            dark: '#E5E5E7'
          },
          secondary: {
            light: '#6A6A6A',
            dark: '#98989A'
          }
        },
        success: '#4CAF50',
        error: '#E74C3C',
        border: {
          light: '#E0D9D2',
          dark: '#3A3A3E'
        }
      },
      spacing: {
        'card': '24px',
        'grid-gap': '20px'
      },
      borderRadius: {
        'card': '16px',
        'pill': '24px'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'heading': ['24px', { fontWeight: '500' }],
        'subheading': ['18px', { fontWeight: '500' }],
        'body': ['16px', { fontWeight: '400' }],
        'body-sm': ['14px', { fontWeight: '400' }],
        'number': ['20px', { fontWeight: '700' }]
      }
    },
  },
  plugins: [],
}