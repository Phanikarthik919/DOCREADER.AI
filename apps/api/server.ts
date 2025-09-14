import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdf from 'pdf-parse';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error("\nFATAL ERROR: GEMINI_API_KEY is not defined.\n");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
    console.error("\nFATAL ERROR: MONGODB_URI is not defined.\n");
    process.exit(1);
}

const app = express();
const port = 3001;
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Could not connect to MongoDB Atlas', err));

// --- NEW, COMPREHENSIVE DATABASE SCHEMA ---
const lineItemSchema = new mongoose.Schema({
  description: String,
  unitPrice: Number,
  quantity: Number,
  total: Number,
});

const invoiceSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  vendor: {
    name: String,
    address: String,
    taxId: String,
  },
  invoice: {
    number: String,
    date: String,
    currency: String,
    subtotal: Number,
    taxPercent: Number,
    total: Number,
    poNumber: String,
    poDate: String,
  },
  lineItems: [lineItemSchema],
  createdAt: { type: Date, default: Date.now },
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
const upload = multer({ storage: multer.memoryStorage() });

// --- THE NEW, POWERFUL /extract ENDPOINT ---
app.post('/extract', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file was uploaded.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze the following document (which could be an image or text from a PDF) and extract all relevant invoice information.
      Return the answer ONLY as a valid JSON object. Do not include any other text or markdown.
      The JSON object must have this exact structure:
      {
        "vendor": { "name": "string", "address": "string", "taxId": "string" },
        "invoice": { "number": "string", "date": "string", "currency": "string", "subtotal": number, "taxPercent": number, "total": number, "poNumber": "string", "poDate": "string" },
        "lineItems": [{ "description": "string", "unitPrice": number, "quantity": number, "total": number }]
      }
      If any value is not found, use an empty string "" for strings and 0 for numbers.
    `;

    let result;
    // Check if the file is an image or a PDF
    if (req.file.mimetype.startsWith('image/')) {
      // It's an image, use multimodal extraction
      const imagePart = {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype,
        },
      };
      result = await model.generateContent([prompt, imagePart]);

    } else if (req.file.mimetype === 'application/pdf') {
      // It's a PDF, parse text first
      const data = await pdf(req.file.buffer);
      if (!data.text) {
        return res.status(400).json({ error: 'Could not read text from the PDF.' });
      }
      result = await model.generateContent(prompt + "\n\nDocument Text:\n---\n" + data.text);
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or an image.' });
    }
    
    const responseText = result.response.text();
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const extractedData = JSON.parse(jsonString);

    res.status(200).json(extractedData);

  } catch (error) {
    console.error('Error during AI extraction process:', error);
    res.status(500).json({ error: 'An internal server error occurred during extraction.' });
  }
});

// --- FULLY IMPLEMENTED CRUD OPERATIONS ---
app.post('/invoices', async (req, res) => {
  try {
    const newInvoice = new Invoice(req.body);
    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(400).json({ error: "Failed to save invoice.", details: error });
  }
});

app.get('/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve invoices." });
  }
});

app.delete('/invoices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedInvoice = await Invoice.findByIdAndDelete(id);
        if (!deletedInvoice) return res.status(404).json({ error: "Invoice not found." });
        res.status(200).json({ message: "Invoice deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete invoice." });
    }
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});