# Next.js 16 Messenger Dashboard - Design System

## 🎯 Overview
Minimal, Clean, and Modern design system for Next.js 16 + Tailwind CSS

## 🚀 Quick Setup
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 🎨 Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        'primary-hover': '#4F46E5',
        gray: {
          50: '#FAFAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      }
    },
  },
  plugins: [],
}
```

## 📱 Ready-to-Use Components

### Button System
```typescript
// Primary Action Button
const PrimaryButton = ({ children, onClick }) => (
  <button
    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    onClick={onClick}
  >
    {children}
  </button>
);

// Secondary Button
const SecondaryButton = ({ children, onClick }) => (
  <button
    className="px-6 py-3 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
    onClick={onClick}
  >
    {children}
  </button>
);
```

### Card Components
```typescript
const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="text-blue-600 text-2xl">{icon}</div>
    </div>
  </div>
);
```

## 🎯 CSS Variables in globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #3B82F6;
  --primary-hover: #4F46E5;
  --background: #FAFAFB;
  --surface: #FFFFFF;
  --border: #E5E7EB;
  --text-primary: #111827;
  --text-secondary: #6B7280;
}

body {
  @apply bg-background text-text-primary font-inter;
}
```

## 📋 Color Usage Guide

| Use Case | Primary Color | Usage |
|----------|---------------|--------|
| Primary Actions | Blue #3B82F6 | Buttons, links, highlights |
| Success | Green #10B981 | Success states, good metrics |
| Warning | Yellow #F59E0B | Alerts, pending actions |
| Error | Red #EF4444 | Errors, critical states |
| Neutral | Gray #6B7280 | Secondary text, borders |

## 🔧 Quick Implementation

### 1. Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Cards will auto-organize */}
</div>
```

### 2. Sidebar Navigation
```tsx
<nav className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
  <div className="p-6">
    <h1 className="text-xl font-bold text-gray-900">Messenger Dashboard</h1>
  </div>
</nav>
```

### 3. Data Table
```tsx
<table className="w-full bg-white rounded-lg shadow-sm">
  <thead className="border-b border-gray-200">
    <tr className="text-left text-sm font-medium text-gray-500">
      <th className="px-6 py-4">Name</th>
    </tr>
  </thead>
  <tbody>
    {/* Data rows */}
  </tbody>
</table>
```

## 📊 Component Showcase

### Dashboard Overview
- **Stats Cards**: Conversations, Customers, Response Time, Satisfaction
- **Recent Conversations**: List with customer profiles
- **Agent Performance**: Sidebar with activity indicators

### Messenger Interface
- **Conversation View**: Message thread with customer info
- **Quick Replies**: Template buttons
- **Customer Profile**: Side panel with history

### Settings
- **User Management**: Role-based forms
- **System Configuration**: Clean input forms
- **Audit Logs**: Timeline view with search

## ⏱️ Next Steps
1. ✅ Design system defined
2. ⏳ Awaiting approval for Steps 1-3
3. 🚧 Implementation pending your confirmation