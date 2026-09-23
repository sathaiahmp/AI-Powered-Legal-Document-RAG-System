# AI Legal Document Analyzer - Frontend

The frontend application for the AI Legal Document Analyzer, built with Next.js. It provides a modern, responsive interface for users to upload legal documents and interact with the AI analysis features.

## Features

- **Next.js**: React framework for production-grade applications.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Shadcn UI**: Reusable components built with Radix UI and Tailwind.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.

## Requirements

- Node.js 18+
- npm or pnpm

## Local Setup (Without Docker)

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env.local` file in this directory.
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Access the application**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Directory Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components.
- `lib/`: Utility functions and API clients.
- `public/`: Static assets.
