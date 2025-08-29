# BalanceBeam - Personal Budgeting Dashboard

![App Preview](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=300&fit=crop&auto=format)

A comprehensive personal budgeting platform built with Next.js and Cosmic CMS. Track income, expenses, and financial goals with beautiful data visualizations and an intuitive interface.

## ✨ Features

- **📊 Interactive Dashboard** - Real-time cash flow visualization with charts and balance tracking
- **💰 Transaction Management** - Add, edit, and delete income/expense transactions with ease
- **🏷️ Category Organization** - Custom categories with color coding for better organization  
- **🔐 Secure Authentication** - JWT-based user authentication with email/password
- **🌙 Dark Mode** - Toggle between light and dark themes
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **📈 Financial Analytics** - Visual insights into spending patterns and income trends

<!-- CLONE_PROJECT_BUTTON -->

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> No content model prompt provided - app built from existing content structure

### Code Generation Prompt

> {
  "appName": "BalanceBeam",
  "description": "A simple, visually appealing budgeting platform to track money in and out with a clean dashboard design.",
  "techStack": {
    "framework": "Next.js",
    "language": "TypeScript",
    "database": "Cosmic CMS",
    "auth": "JWT authentication with email/password",
    "storage": "Cosmic for user accounts, transactions, categories"
  },
  "pages": [
    {
      "name": "Landing Page",
      "details": "Public page with hero section, features, and call-to-action to sign up."
    },
    {
      "name": "Sign Up",
      "details": "Form for name, email, password, confirm password. Creates new user."
    },
    {
      "name": "Login",
      "details": "Form for email and password. Issues JWT and redirects to dashboard."
    },
    {
      "name": "Dashboard",
      "details": "Private page. Shows cards for income, expenses, net balance. Line chart for cash flow, pie chart for categories, and recent transactions."
    },
    {
      "name": "Transactions",
      "details": "List of all transactions with filters. Add/edit/delete transactions via modal form."
    },
    {
      "name": "Profile/Settings",
      "details": "Update account details, manage categories, toggle dark mode, and log out."
    }
  ],
  "contentModel": {
    "User": {
      "fields": ["id", "name", "email", "passwordHash", "createdAt", "updatedAt"]
    },
    "Transaction": {
      "fields": ["id", "userId", "type", "amount", "category", "note", "date"]
    },
    "Category": {
      "fields": ["id", "userId", "name", "color"]
    }
  },
  "userFlow": {
    "signup": [
      "User visits /signup",
      "Enter name, email, password, confirm password",
      "System validates email uniqueness",
      "Creates user in Cosmic CMS",
      "Redirect to /dashboard with starter categories"
    ],
    "login": [
      "User visits /login",
      "Enter email and password",
      "JWT issued on success",
      "Redirect to /dashboard"
    ],
    "logout": [
      "Click logout in settings",
      "Clear JWT from local storage",
      "Redirect to /login"
    ],
    "insideApp": {
      "dashboard": "Cards for income, expenses, balance. Line chart. Pie chart. Recent transactions.",
      "transactions": "Full table with filters. Add/edit/delete transactions.",
      "settings": "Update account, manage categories, toggle dark mode, logout."
    }
  },
  "ui": {
    "style": "Warm neutral palette, card-based design, clean typography, rounded corners, soft shadows, and pill-shaped navigation.",
    "colors": {
      "background": "#FAF7F2",
      "card": "#F3EDE6",
      "accent": "#F5C84C",
      "textPrimary": "#2F2F2F",
      "textSecondary": "#6A6A6A",
      "success": "#4CAF50",
      "error": "#E74C3C",
      "border": "#E0D9D2"
    },
    "spacing": {
      "cardRadius": "16px",
      "cardPadding": "24px",
      "gridGap": "20px",
      "tabPaddingHorizontal": "24px",
      "tabPaddingVertical": "12px",
      "tableRowHeight": "48px"
    },
    "typography": {
      "font": "Inter, Poppins, or sans-serif",
      "heading": "24px medium",
      "subheading": "18px medium",
      "body": "14-16px regular",
      "numbers": "20px bold"
    }
  },
  "pwa": true,
  "extras": {
    "darkMode": true
  }
}

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## 🛠️ Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Cosmic CMS** - Headless CMS for data management
- **Chart.js** - Beautiful data visualizations
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Cosmic account with your existing bucket

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables (see Environment Variables section below)

4. Run the development server:
   ```bash
   bun run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📡 Cosmic SDK Examples

### Fetching User Transactions
```typescript
import { cosmic } from '@/lib/cosmic'

// Get all transactions for a user with category data
const transactions = await cosmic.objects
  .find({ 
    type: 'transactions',
    'metadata.user': userId 
  })
  .props(['id', 'title', 'metadata'])
  .depth(1)
```

### Creating a New Transaction
```typescript
const newTransaction = await cosmic.objects.insertOne({
  type: 'transactions',
  title: 'Grocery Shopping',
  metadata: {
    user: userId,
    type: { key: 'expense', value: 'Expense' },
    amount: 125.50,
    category: categoryId,
    description: 'Weekly groceries',
    date: '2025-01-15'
  }
})
```

## 🌟 Cosmic CMS Integration

This application leverages your existing Cosmic content structure:

- **Users** - User accounts with authentication details and preferences
- **Transactions** - Financial transactions with type, amount, category, and date
- **Categories** - Expense and income categories with color coding

The app uses Cosmic's object relationships to connect transactions to users and categories, providing a rich, interconnected data model for comprehensive financial tracking.

## 🚀 Deployment Options

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Netlify
1. Build the project: `bun run build`
2. Deploy the `out` folder to Netlify
3. Set environment variables in Netlify dashboard

### Environment Variables
Set these in your deployment platform:
- `COSMIC_BUCKET_SLUG` - Your Cosmic bucket slug
- `COSMIC_READ_KEY` - Your Cosmic read key  
- `COSMIC_WRITE_KEY` - Your Cosmic write key
- `JWT_SECRET` - Secret key for JWT tokens (minimum 32 characters)

## 📱 PWA Features

BalanceBeam is built as a Progressive Web App (PWA) with:
- Offline capability
- App-like experience on mobile devices
- Fast loading with caching strategies
- Installable on home screen

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
