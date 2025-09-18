import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdf from 'pdf-parse';

// Load environment variables from .env file
dotenv.config();

// --- CRITICAL: Check for API Key at startup ---
if (!process.env.GEMINI_API_KEY) {
  console.error("\nFATAL ERROR: GEMINI_API_KEY is not defined in the .env file.");
  console.error("Please create a .env file in the 'apps/api' directory and add your key.\n");
  process.exit(1); // Stop the server if the key is missing
}

const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(cors());

// --- Database Connection & Schema (No changes here) ---
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Could not connect to MongoDB Atlas', err));

const invoiceSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  vendorName: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// --- API ROUTES ---

app.post('/extract', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file was uploaded.' });
  }

  try {
    // 1. Parse text from the uploaded PDF buffer
    const data = await pdf(req.file.buffer);
    if (!data.text) {
        return res.status(400).json({ error: 'Could not read text from the PDF.' });
    }
    const pdfText = data.text;

    // 2. Prepare the request for the Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze the following invoice text and extract the vendor's name and the invoice number.
      Return the answer ONLY as a valid JSON object with the keys "vendorName" and "invoiceNumber".
      If you cannot find a value, return an empty string for that key.
      Example: {"vendorName": "Acme Corp", "invoiceNumber": "INV-12345"}
      
      Invoice Text:
      ---
      ${pdfText}
      ---
    `;

    // 3. Call the AI and get the response
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // 4. Robustly parse the AI's response
    let extractedData;
    try {
      // Clean the string to remove markdown and other unwanted characters
      const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      extractedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON. Response was:", responseText);
      // If parsing fails, send a specific, user-friendly error
      return res.status(500).json({ error: "The AI returned an unexpected format. Please try again." });
    }

    // 5. Send the successfully extracted data back to the frontend
    res.status(200).json(extractedData);

  } catch (error) {
    console.error('Error during AI extraction process:', error);
    res.status(500).json({ error: 'An internal server error occurred during extraction.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});