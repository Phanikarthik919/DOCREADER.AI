DOCREADER.AI - Intelligent Invoice Processing Dashboard

DOCREADER.AI is a modern, full-stack web application designed to streamline invoice processing. Users can upload invoice documents (PDFs, images), leverage AI to extract key information, review and edit the data in a user-friendly interface, and manage their saved records in an interactive table.

Overview

This project uses a modern tech stack including Next.js, Tailwind CSS, and Shadcn UI to provide a smooth, responsive, and intuitive user experience.

Features

📄 Document Upload: Smooth interface for uploading PDFs and images.

👁️ Interactive Document Viewer: Embedded viewer to preview the uploaded document.

✨ AI-Powered Data Extraction: One-click extraction using AI providers like Gemini or Groq.

✍️ Editable Data Form: View and edit extracted data including vendor info, invoice details, and line items.

➕ Dynamic Line Items: Add or remove line items with automatic total recalculation.

↔️ Resizable Split Layout: Adjustable panels between document viewer and data form.

📊 Interactive Data Table: Manage all saved invoices with sorting, filtering, and pagination.

📥 PDF Download: Generate and download clean PDFs of verified invoice data.

Tech Stack

Framework: Next.js (React)

Styling: Tailwind CSS

Component Library: Shadcn UI

Resizable Layout: React Resizable Panels

Data Table: TanStack Table

PDF Generation: jsPDF & jsPDF-AutoTable

Icons: Lucide React

Language: TypeScript

Getting Started
Prerequisites

Node.js (v18.0 or higher)

pnpm (or your preferred package manager)

Installation

Clone the repository:

git clone https://github.com/your-username/docreader-ai.git
cd docreader-ai


Install frontend dependencies:

pnpm install


Set up the backend server for file extraction and database interactions. Make sure it’s running (e.g., at http://localhost:3001).

Start the development server:

pnpm run dev


Open http://localhost:3000
 in your browser.

Available Scripts

pnpm dev – Start the app in development mode

pnpm build – Build the app for production

pnpm start – Start a production server

pnpm lint – Lint the code

Deployment

Deploy easily using Vercel:

Push your code to a Git repository (GitHub, GitLab, etc.).

Import the repository into Vercel.

Set your backend API URL as an environment variable (e.g., NEXT_PUBLIC_API_URL).

Click Deploy.