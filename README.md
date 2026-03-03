# White Copy Enterprises - ERP System

A professional Enterprise Resource Planning (ERP) solution built for **White Copy Enterprises** to manage school clients, inventory, and automated invoicing. This system features real-time multi-device synchronization using Supabase.

## 🚀 Features

* **Dashboard**: Real-time business overview of total revenue, outstanding debts, and inventory health.
* **School Client Management**: Track school profiles, total debt, and payment history.
* **Inventory & Spares**: Manage stock levels for printers, inks, masters, and spare parts with low-stock alerts.
* **Invoicing & Deliveries**: Generate professional PDF invoices and delivery notes.
* **Multi-Device Sync**: Access and update your data from both your laptop and mobile phone simultaneously.

## 🛠️ Tech Stack

* **Frontend**: React (TypeScript), Tailwind CSS
* **Database**: Supabase (PostgreSQL)
* **Hosting**: Netlify
* **Icons & UI**: Lucide React, Recharts
* **PDF Generation**: jsPDF, jsPDF-AutoTable

## 📦 Setup & Installation

### 1. Prerequisites
* Node.js installed on your machine.
* A Supabase project created.

### 2. Local Setup
1.  Clone the repository:
    ```bash
    git clone [https://github.com/dave00090/white-copy-.git](https://github.com/dave00090/white-copy-.git)
    cd white-copy-
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
    ```
4.  Run the app locally:
    ```bash
    npm run dev
    ```

### 3. Database Schema
Run the provided SQL scripts in your Supabase SQL Editor to create the `products`, `clients`, and `invoices` tables. Ensure **Row Level Security (RLS)** is configured to allow access for your devices.

## 🌐 Deployment (Netlify)

To ensure the app works on mobile devices via Netlify:
1.  Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to **Site Settings > Environment Variables** in the Netlify dashboard.
2.  Set the **Build Command** to `npm run build`.
3.  Set the **Publish Directory** to `dist`.
4.  Ensure a `_redirects` file exists in the `public` folder with the content: `/* /index.html 200`.

## 🔒 Security
The `.env` file is excluded from version control via `.gitignore` to protect sensitive API keys.

---
© 2026 White Copy Enterprises. Built by Dave.