DOCREADER.AI: AI-Powered Dynamic Document Data Extraction
DOCREADER.AI is a modern, full-stack web application designed to streamline document processing. Users can upload PDF or image files (invoices, reports, etc.), and the application leverages advanced AI to dynamically extract tabular data. The extracted information is displayed in a fully editable table, can be modified, saved to a database, and regenerated as a clean PDF document.

This project is built on a robust monorepo architecture using Turborepo and pnpm, with a Next.js frontend and a Node.js/Express backend.

Deployed Links
Live Web Application: https://<YOUR_PROJECT_NAME>-web.vercel.app

Live API Server: https://<YOUR_PROJECT_NAME>-api.vercel.app

Core Features
Multi-Format Upload: Supports both PDF documents and common image formats (PNG, JPG, etc.).

Dynamic AI Data Extraction: Intelligently analyzes document content to extract the complete table structure, including all headers and rows, regardless of the layout.

Interactive Data Table: Displays all extracted data in a fully editable table, allowing for real-time corrections and modifications.

PDF Regeneration & Download: Generates and downloads a clean, professional PDF from the extracted (and potentially edited) data.

CRUD Functionality: Full Create, Read, and Delete operations for persisting extracted data in a MongoDB database.

Modern UI/UX: A beautiful, responsive "glassmorphism" interface with a professional Header/Footer layout, resizable panels, and non-intrusive toast notifications.

Local Setup
1. Clone the Repository
git clone [https://github.com/Phanikarthik919/DOCREADER.AI.git](https://github.com/Phanikarthik919/DOCREADER.AI.git)
cd DOCREADER.AI

2. Install Dependencies
This project uses pnpm as its package manager. The following command will install dependencies for the entire monorepo.

pnpm install

3. Set Up Environment Variables
This project requires two separate .env files for secret keys and local configuration.

a) For the Backend (apps/api/.env):
Create a file named .env inside the apps/api directory.

GEMINI_API_KEY="YOUR_GOOGLE_AI_GEMINI_API_KEY"
MONGODB_URI="YOUR_MONGODB_CONNECTION_STRING"

b) For the Frontend (apps/web/.env.local):
Create a file named .env.local inside the apps/web directory. This tells your local frontend where to find your local backend.

# This is not needed for deployment, only for local development.
# The deployed frontend will get its API URL from Vercel's environment variables.

(No variables are needed in this file for your current setup, but it is good practice to have it.)

How to Run Locally
You must have two separate terminals open to run both the backend and frontend servers simultaneously.

1. Run the Backend API:
From the project's ROOT directory, run:

pnpm dev --filter api

The server will start on http://localhost:3001.

2. Run the Frontend Web App:
From the project's ROOT directory, run:

pnpm dev --filter web

The application will be available at http://localhost:3000.

API Documentation
1. Extract Data from Document
Endpoint: POST /extract

Description: Accepts a file (PDF or image) and returns a dynamically structured JSON object containing the extracted table data.

Request: multipart/form-data with a single field named file.

Sample Success Response (200 OK):

{
  "headers": ["Item Description", "Quantity", "Unit Price", "Total"],
  "rows": [
    ["Product A", 2, 50.00, 100.00],
    ["Service B", 1, 250.50, 250.50]
  ]
}

2. Save an Invoice
Endpoint: POST /invoices

Description: Saves a complete, structured invoice record to the database.

Sample Request Body:

{
  "fileName": "invoice-123.pdf",
  "headers": ["Product", "Price"],
  "rows": [
    ["Laptop", 1500],
    ["Mouse", 50]
  ]
}

3. Get All Saved Invoices
Endpoint: GET /invoices

Description: Retrieves a list of all invoices from the database, sorted by most recent.

4. Delete an Invoice
Endpoint: DELETE /invoices/:id

Description: Deletes an invoice from the database using its unique MongoDB _id.
