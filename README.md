# Daily Expenses Tracker

A modern, self-hosted expense tracking application built with Next.js, Supabase, and shadcn/ui. Track your daily expenses with meaningful charts, categorize spending, and gain insights into your financial habits. Furthermore, you may track debts, savings, loans, and any financial goals outside of daily expenses. Each tracker maintains a running balance with debit (money in) and credit (money out) entries, giving you a clear view of your financial progress over time.

| Dashboard                                                     | Expenses                                      | Trackers                                      |
| ------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------- |
| ![Dashboard](public/screenshots/yearly_charts_zoomedout.webp) | ![Expenses](public/screenshots/expenses.webp) | ![Trackers](public/screenshots/trackers.webp) |

## Features

- **Meaningful Yearly Charts** - Visualize spending with interactive charts over the year
- **Monthly View** - Track expenses month by month
- **Members, Categories & Tags** - Organize expenses by family members, category and location
- **AI-Powered PDF Import** - Upload bank statements and let Google Gemini automatically extract transactions with smart categorization for analysis or migration
- **CSV Export** - Import your expense data from excel/sheets for analysis or migration
- **Dark Mode** - UI in both light and dark themes
- **Password Protected** - Simple password protection for your data
- **Responsive** - Works on desktop, tablet, and mobile
- **Yearly Analytics** - Comprehensive yearly spending insights
- **Debt Repayment**: Credit cards, personal loans, or money owed
- **Savings Goals**: Emergency fund, vacation savings, house down payment
- **Friend Loans**: Money lent or borrowed from friends/family
- **Project Funds**: Budget tracking for specific projects or goals

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

#### 1. **Node.js** (v18 or higher)

- Download from [nodejs.org](https://nodejs.org/)
- Verify installation:
  ```bash
  node --version
  # Should output: v18.x.x or higher
  ```

#### 2. **pnpm** (Package Manager)

Install pnpm globally:

```bash
npm install -g pnpm
```

Verify installation:

```bash
pnpm --version
# Should output: 8.x.x or higher
```

> **Note:** You can also use `npm` or `yarn` instead of `pnpm`. Just replace `pnpm` with your preferred package manager in all commands.

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/Usmansagemode/daily-expenses-tracker
cd daily-expenses-tracker
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Set Up Supabase

#### 3.1 Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign in with **GitHub** or **Email**
4. Click **"New Project"**

#### 3.2 Create a New Project

Fill in the following:

- **Name**: `daily-expenses` (or any name you prefer)
- **Database Password**: Generate a strong password (save it securely!)
- **Region**: Choose the closest region to you
- **Pricing Plan**: Select **Free** tier

Click **"Create new project"** and wait ~2 minutes for setup.

#### 3.3 Get Your API Credentials

Once your project is ready:

1. Click on **Project Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

#### 3.4 Create Database Tables

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New Query"**
3. Copy and paste the following SQL:

```sql
-- Expenses table
 -- Drop the existing table (this will delete all data)
DROP TABLE expenses;

-- Recreate with camelCase
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  amount NUMERIC(10,2) NOT NULL,
  "categoryId" TEXT,
  "tagId" TEXT,
  date DATE NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;

-- Insert sample expense (not required)
INSERT INTO expenses (id, amount, "categoryId", "tagId", date, description) VALUES
('1', 127.45, '1', 'costco', '2025-10-14', 'Weekly groceries at Costco');

-- Trackers table
create table if not exists public."trackers" (
  "id" uuid primary key default gen_random_uuid(),
  "title" text not null,
  "description" text,
  "initialBalance" numeric(12, 2) not null default 0,
  "currentBalance" numeric(12, 2) not null default 0,
  "color" text,
  "createdAt" timestamp with time zone not null default timezone('utc'::text, now()),
  "updatedAt" timestamp with time zone not null default timezone('utc'::text, now())
);

-- Tracker entries table
create table if not exists public."trackerEntries" (
  "id" uuid primary key default gen_random_uuid(),
  "trackerId" uuid not null references public."trackers"("id") on delete cascade,
  "date" date not null,
  "description" text,
  "debit" numeric(12, 2) not null default 0,
  "credit" numeric(12, 2) not null default 0,
  "balance" numeric(12, 2) not null default 0,
  "createdAt" timestamp with time zone not null default timezone('utc'::text, now())
);

```

4. Click **"Run"** to execute the queries

### Step 4: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# App Password Protection
APP_PASSWORD=your_secure_password_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxx...

# Google Gemini Configuration (Optional - for in-app PDF import)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Anthropic Configuration (Optional - for CLI PDF parsing script)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Note: You may use the app without either Supabase keys or Gemini Keys.

- Demo data will be used if you dont add Supabase keys
- Only AI PDF will not work if Gemini key is not added.
- The CLI PDF parsing script (`npm run parse-pdf`) needs either Claude Code CLI or `ANTHROPIC_API_KEY`.

**Replace:**

- `your_secure_password_here` → Your chosen password for the app. You only need this if you are hosting this to Vercel and want some security.
- `https://xxxxx.supabase.co` → Your Supabase Project URL
- `eyJxxxxxxxxxxx...` → Your Supabase anon public key
- `your_gemini_api_key_here` → Your Google Gemini API key for AI PDF processing

> **Important:** Never commit `.env.local` to GitHub!

### Step 5: Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the login page. Enter your `APP_PASSWORD` to access the app!

---

## AI-Powered PDF Import

The app includes intelligent PDF processing using Google Gemini AI:

### How it works:

1. **Upload any bank statement PDF** from your financial institution
2. **AI automatically extracts** transactions, dates, amounts, and descriptions
3. **Smart categorization** matches transactions to your existing categories
4. **Automatic filtering** excludes transfers, fees, and credit card payments
5. **Preview and edit** before saving to your database

### Setting up Gemini AI:

1. Get your API key from [Google AI Studio](https://aistudio.google.com/)
2. Add `GOOGLE_GEMINI_API_KEY` to your `.env.local` file
3. The app will automatically enable AI import features

### Without Gemini:

You can still use CSV import with manual mapping - all other features work normally!

## Customizing Members, Categories & Tags

### Option 1: Update Default Data (Before First Run)

Categories are meant to represent broad spending types (e.g., food, transport, utilities), while tags can be used for specific vendors or locations (e.g., Walmart, Target, Amazon).
Simply update the lists in src/lib/config.ts to match your personal or project requirements.
The intention for Members is to be able to set who paid for the expense. This will enable you to see how much a certain family member/friend is paying.
The GEMINI_PDF_RULES constant controls how Google Gemini processes your bank statements.

Edit `src/lib/config.ts`:

```typescript
export const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Grocery", createdAt: new Date("2025-01-01") },
  { id: "2", name: "Petrol", createdAt: new Date("2025-01-01") },
  // Add your own categories here
];

export const DEFAULT_TAGS: Tag[] = [
  { id: "costco", name: "Costco", createdAt: new Date("2025-01-01") },
  { id: "aldi", name: "Aldi", createdAt: new Date("2025-01-01") },
  // Add your own locations here
];

// Default members to choose who paid
export const DEFAULT_MEMBERS: Member[] = [
  {
    id: "1",
    fullName: "Roronoa Zoro",
    name: "Zoro",
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "2",
    fullName: "Monkey D. Luffy",
    name: "Luffy",
    createdAt: new Date("2025-01-01"),
  },
];

// These rules that are used in the prompt for GEMINI - It makes the AI customization more discoverable for users who want to fine-tune the PDF processing.
export const GEMINI_PDF_RULES = `Rules:
1. Use default amounts for expenses.....`;
```

## App Icon / Favicon

You can customize the favicon (the small icon shown in browser tabs) to match your brand or theme.  
Replace the default icon file at:

`/public/favicon.ico`

For best results, use a 512x512 PNG and convert it to .ico using a free tool like favicon.io.

---

## Deploying to Vercel

### Step 1: Push to GitHub

1. Create a new repository on [GitHub](https://github.com/new)
2. Push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/daily-expenses-tracker.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. **Import** your GitHub repository
4. Click **"Deploy"**

### Step 3: Set Environment Variables in Vercel

1. Go to your project in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:
   - `APP_PASSWORD` → Your secure password
   - `NEXT_PUBLIC_SUPABASE_URL` → Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Your Supabase anon key
   - `GOOGLE_GEMINI_API_KEY` → Your Gemini api key
4. Click **"Save"**
5. **Redeploy** your project (Deployments → ⋯ → Redeploy)

### Step 4: Access Your App

Your app will be live at: `https://your-project-name.vercel.app`

> **Security:** Your app is now password-protected. Only share the password with people you trust!

---

## Security Best Practices

### For Local Development:

- Keep `.env.local` private (never commit it)
- Use a strong `APP_PASSWORD`
- Keep your database password secure

### For Production:

1. **Use a strong APP_PASSWORD** (at least 12 characters)
2. **Enable HTTPS** (Vercel does this automatically)
3. **Don't share your password publicly**
4. **Regularly backup your Supabase database**
   - Go to Supabase → Database → Backups

### Optional: Add IP Whitelisting

If you want extra security, you can restrict access to specific IPs in Vercel:

1. Go to **Settings** → **Firewall**
2. Add your home/work IP addresses

---

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **Tables:** [TanStack Table](https://tanstack.com/table)
- **State Management:** [TanStack Query (React Query)](https://tanstack.com/query)
- **Type Safety:** TypeScript
- **AI/ML:** [Google Gemini](https://ai.google.dev/) - For intelligent PDF processing

---

## Usage Guide

### Adding an Expense

1. Click **"Add Expense"** button
2. Fill in:
   - **Date**: When the expense occurred
   - **Category**: Type of expense (Grocery, Takeout, etc.)
   - **Location**: Where you spent (optional)
   - **Amount**: How much you spent
   - **Description**: Notes about the expense (optional)
3. Click 'Save Changes' to store updates to the database!

### Importing Expenses

Import expenses in bulk from CSV files or PDF bank statements:

#### CSV Import

1. Navigate to **Import** page
2. Select **"CSV File"** option
3. Choose your document style:
   - **Standard Format**: For bank statements or spreadsheets with date, amount, and description in separate columns
   - **Wide Format**: For spreadsheets where each category is a column (e.g., monthly budget trackers)
4. Upload your CSV file
5. Map columns to expense fields (auto-detection will suggest matches)
6. Review and edit the imported data in the preview
7. Click **"Save"** to add all expenses to your database

#### PDF Bank Statement Import (AI-Powered)

1. Navigate to **Import** page
2. Select **"PDF Bank Statement"** option
3. Upload your bank statement PDF (works with any bank format)
4. AI will automatically:
   - Extract all transactions
   - Parse dates, amounts, and merchant names
   - Categorize expenses based on your existing categories
   - Clean up and format the data
5. Review and edit the imported transactions in the preview
6. Click **"Save"** to add expenses to your database

**Note**: PDF parsing uses Google Gemini AI and may take 10-30 seconds. The free tier allows 1,500 requests per day.

#### PDF Bank Statement Import (Claude CLI)

As an alternative to the in-app Gemini PDF import, you can use the included CLI script powered by [Claude Code](https://docs.anthropic.com/en/docs/claude-code). This runs locally via the Claude Code CLI and outputs a wide-format CSV ready for upload.

**Prerequisites (one of the following):**

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated, **or**
- `ANTHROPIC_API_KEY` set in your `.env.local` or shell environment

**Usage:**

```bash
# Basic usage — output goes to scripts/output/
npm run parse-pdf -- ./bank-statement.pdf

# Custom output path
npm run parse-pdf -- ./bank-statement.pdf --output ./my-expenses.csv

# Specify which member paid
npm run parse-pdf -- ./bank-statement.pdf --member Anoosha
```

The script will:
1. Spawn a Claude agent that reads the PDF
2. Extract and categorize all transactions using your configured categories, tags, and members
3. Output a wide-format CSV to `scripts/output/`

Then simply upload the generated CSV via **Import > CSV File > Wide Format** in the app.

### Viewing Analytics

- Navigate to **Yearly Charts** to see:
  - Monthly spending trends for the year
  - Category breakdowns
  - Average spending per category
  - Spending over time
  - And many more to come

### Managing Categories

Categories and tags are stored locally for simplicity since they rarely change once set up.
Keeping them client-side avoids unnecessary database queries and keeps the app fast.
However, avoid removing categories that are already used in stored expenses, as that may lead to mismatched or meaningless charts. Or at least keep the minimum count of categories and tags the same.

### Managing Trackers

Trackers let you manage finances beyond daily expenses — like debts, loans, savings goals, or any running balance you want to track.

1. Click **“Add Tracker”** to create a new tracker (e.g., “Vacation Savings”, “Credit Card”, “Car Loan”).
2. Add entries to record debits (money added) or credits (money spent).
3. Each tracker automatically maintains a **running balance**.
4. You can **edit**, **delete**, or **clean up** entries (remove empty or zero-value records) anytime.
5. The **color bar** on the left helps you visually distinguish between different trackers.

---

## Development

### Project Structure

```
daily-expenses-tracker/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── expenses/          # Expenses table page
│   │   ├── yearly-charts/     # Analytics page
│   │   ├── trackers/          # Track debts, savings, loans etc table page
│   │   └── login/             # Login page
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── yearly-charts/           # Chart components
│   │   └── expenses/         # Expense-related components
│   │   └── trackers/         # Track-related components
│   ├── entities/             # Data models & types
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Config, Utilities & Supabase client
│   └── middleware.ts         # Password protection middleware
├── .env.local                # Environment variables (not in git)
├── package.json
└── README.md
```

### Available Scripts

```bash
# Development
pnpm dev          # Start dev server (localhost:3000)

# Build
pnpm build        # Build for production
pnpm start        # Start production server

# Linting
pnpm lint         # Run ESLint

# PDF Parsing (requires Claude Code CLI)
npm run parse-pdf -- ./statement.pdf
```

### Adding New Features

Want to extend the app? Here are some ideas:

- Budget limits per category
- Email reports
- Multi-user support with proper auth
- More chart types
- Export to CSV/Excel Done
- Spending alerts

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Supabase](https://supabase.com/) for the awesome backend
- [Vercel](https://vercel.com/) for seamless deployment

---

## Support

If you have questions or run into issues:

1. Check existing [GitHub Issues](https://github.com/yourusername/daily-expenses-tracker/issues)
2. Create a new issue with detailed information
3. Star ⭐ the repo if you find it helpful!

---

## Roadmap

- [ ] Multi-currency support
- [ ] Budget tracking
- [ ] Mobile app (React Native)
- [ ] Receipt upload & OCR
- [ ] Multi-user/family sharing
- [ ] Export reports (PDF, CSV)

## License

This project is open-source and available under the [MIT License](./LICENSE).

## Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open a [discussion](../../discussions) or [pull request](../../pulls).

---

**Made with care and love by Usman Khalid Mian**

[⬆ Back to top](#-daily-expenses-tracker)
