📄 DOCREADER.AI: AI-Powered Dynamic Document Data Extraction
✨ DOCREADER.AI is a modern, full-stack web application designed to streamline document processing. Users can upload PDF or image files, and the application leverages advanced AI to dynamically extract tabular data. The extracted information is displayed in a fully editable table, can be modified, saved to a database, and regenerated as a clean PDF document.

🚀 This project is built on a robust monorepo architecture using Turborepo and pnpm, with a Next.js frontend and a Node.js/Express backend.

🌐 Deployed Application
→ The application is deployed on Render.

"Although the assignment specified Vercel, I chose to deploy the project on Render due to its robust support for monorepos and seamless integration with pnpm. Both platforms are excellent choices for modern web development."

🔗 Live Web Application: https://docreader-ai-311x.onrender.com

🔗 Live API Server: https://docreader-ai-1.onrender.com

💡 Core Features
→ Multi-Format Upload: Supports both PDF documents and common image formats (PNG, JPG, etc.).

→ Dynamic AI Data Extraction: Intelligently analyzes document content to extract the complete table structure.

→ Interactive Data Table: Displays all extracted data in a fully editable table, allowing for real-time corrections.

→ PDF Regeneration & Download: Generates and downloads a clean, professional PDF from the extracted data.

→ CRUD Functionality: Full Create, Read, and Delete operations for persisting extracted data in a MongoDB database.

→ Modern UI/UX: A responsive interface with a collapsible sidebar and resizable panels.

🚀 Local Setup
This guide assumes you have Node.js v18+ and pnpm installed.

1. Clone the Repository
Bash

git clone https://github.com/Phanikarthik919/DOCREADER.AI.git
cd DOCREADER.AI
2. Install Dependencies
This command installs dependencies for the entire monorepo using pnpm.

Bash

pnpm install
3. Set Up Environment Variables
Create a single file named .env.local in the project's root directory.

GEMINI_API_KEY= "AIzaSyD_Wgl0_t9S-oqC1Z9Py42mBp5fBgkOwl4"

MONGODB_URI= "mongodb+srv://phanikarthikkandukoori:phani1919@cluster0.lcppn.mongodb.net/"


NEXT_PUBLIC_API_URL="http://localhost:3001"

4. Run the Applications
You must run both the backend and frontend servers simultaneously in separate terminals.

Run the Backend API:

Bash

pnpm dev --filter api
The server will be available at http://localhost:3001.

Run the Frontend Web App:

Bash

pnpm dev --filter web
The application will be available at http://localhost:3000.

📖 API Documentation
All API endpoints are hosted on the base URL: https://docreader-ai-1.onrender.com.

1. Extract Data from Document
→ Endpoint: /extract
→ Method: POST
→ Description: Accepts an invoice file and returns extracted data using the Gemini AI model.
→ Request: multipart/form-data with a field named file.
→ Sample Response (200 OK):
json { "vendor": { "name": "string", "address": "string", "taxId": "string" }, "invoice": { "number": "string", "date": "string", "currency": "string", "subtotal": 0, "taxPercent": 0, "total": 0, "poNumber": "string", "poDate": "string" }, "lineItems": [{ "description": "string", "unitPrice": 0, "quantity": 0, "total": 0 }] } 

2. Save an Invoice
→ Endpoint: /invoices
→ Method: POST
→ Description: Saves a new invoice record to the MongoDB database.
→ Request: application/json with a body matching the FullInvoice type.
→ Sample Request Body:
json { "fileName": "sample.pdf", "vendor": { "name": "Phani Corp", "address": "123 Main St", "taxId": "TAX123" }, "invoice": { "number": "INV-001", "date": "2025-09-23", "currency": "$", "total": 120.00 }, "lineItems": [{ "description": "Web Dev Service", "unitPrice": 100, "quantity": 1, "total": 100 }] } 

3. Get All Saved Invoices
→ Endpoint: /invoices
→ Method: GET
→ Description: Retrieves a list of all invoices from the database, sorted by most recent.

4. Delete an Invoice
→ Endpoint: /invoices/:id
→ Method: DELETE
→ Description: Deletes a specific invoice from the database using its unique MongoDB _id.












Tools

