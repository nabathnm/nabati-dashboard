# Nabathi Dashboard

Dashboard is a modern, AI-powered personal finance and task management dashboard built with Next.js. It helps you track your expenses, manage multiple accounts, sync banking transactions automatically from Gmail, and receive personalized AI financial insights to improve your financial health.

## 🌟 Features

### 1. 📊 Comprehensive Dashboard
A beautifully designed, glassmorphism-inspired dashboard that provides a bird's-eye view of your finances:
- Total Balance across all active accounts.
- Quick summary of Active Accounts.
- Recent Transactions and Upcoming Tasks.
- AI Financial Insights snippet.
- Quick Transfer widget for seamless inter-account fund movements.

### 2. 💳 Accounts Management
- Create and manage multiple accounts with different types: **Bank, E-Wallet, Cash, and Savings**.
- Track individual balances and customize account icons and colors.

### 3. 💸 Transaction Tracking
- Log **Incomes, Expenses, and Transfers**.
- Categorize transactions with rich icons (Food, Transport, Bills, Shopping, etc.).
- Filter transactions by category and date.

### 4. 🤖 AI Financial Evaluation (Powered by Gemini API)
- Get a monthly **Financial Health Score**.
- Automatically generates personalized summaries, insights, and recommendations based on your income, expenses, and category-level spending habits.

### 5. 📧 Automatic Gmail Transaction Sync
- Integrates with Google Apps Script to automatically scan your Gmail for banking receipts (e.g., Bank BRI).
- Auto-parses emails to extract amounts and automatically categorizes them as transactions in the database.

### 6. 📈 Analytics & Trends
- **Cash Flow Trend**: Line/bar charts comparing your Income vs. Expenses over the year.
- **Spending by Category**: Interactive Donut Charts showing your expense distribution for the month.

### 7. 📅 Task Management
- Keep track of upcoming deadlines (e.g., Kuliah, Organisasi, Praktikum).
- Visual progress tracking mapped to a calendar and dashboard.

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Data Fetching**: [TanStack React Query](https://tanstack.com/query/latest)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: Lucide React
- **AI Integration**: Google Gemini API

## 🚀 Getting Started

First, make sure you have configured your environment variables in `.env.local` for Supabase and the Gemini API:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
APPS_SCRIPT_URL=your_google_apps_script_url
```

Then, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
