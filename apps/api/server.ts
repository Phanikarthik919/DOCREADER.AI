import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdf from 'pdf-parse';

dotenv.config();

// --- Server Setup ---
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

// --- Connect to MongoDB & Start Server ---
// MOVED THIS BLOCK TO THE TOP: Ensures DB is connected before listening.
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(port, () => console.log(`🚀 API listening on port ${port}`));
  })
  .catch(err => {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  });


// Middleware
app.use(cors({
  origin: "http://localhost:3000", // This is good for local development
  methods: ["GET", "POST", "DELETE"],
  credentials: true
}));
app.use(express.json());

// --- DATABASE SCHEMA --- (Your correct schema)
const lineItemSchema = new mongoose.Schema({
  description: String,
  unitPrice: Number,
  quantity: Number,
  total: Number,
});

const invoiceSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  vendor: { name: String, address: String, taxId: String },
  invoice: {
    number: String,
    date: String,
    currency: String,
    subtotal: Number,
    taxPercent: Number,
    total: Number,
    poNumber: String,
    poDate: String
  },
  lineItems: [lineItemSchema],
  createdAt: { type: Date, default: Date.now },
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
const upload = multer({ storage: multer.memoryStorage() });

// --- AI EXTRACTION --- (Your correct extraction logic)
app.post('/extract', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file was uploaded.' });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze the document and extract all invoice information.
      Return ONLY a valid JSON object with this exact structure:
      {
        "vendor": { "name": "string", "address": "string", "taxId": "string" },
        "invoice": { "number": "string", "date": "string", "currency": "string", "subtotal": number, "taxPercent": number, "total": number, "poNumber": "string", "poDate": "string" },
        "lineItems": [{ "description": "string", "unitPrice": number, "quantity": number, "total": number }]
      }
      If a value isn't found, use "" for strings and 0 for numbers.
    `;

    let result;
    if (req.file.mimetype.startsWith('image/')) {
      const imagePart = {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype
        }
      };
      result = await model.generateContent([prompt, imagePart]);
    } else if (req.file.mimetype === 'application/pdf') {
      const data = await pdf(req.file.buffer);
      if (!data.text) return res.status(400).json({ error: 'Could not read text from PDF.' });
      result = await model.generateContent(prompt + "\n\n---TEXT---\n" + data.text);
    } else {
      return res.status(400).json({ error: 'Unsupported file type.' });
    }

    const responseText = result.response.text();
    console.log("Raw AI Response:", responseText);

    let extractedData;
    try {
      const startIndex = responseText.indexOf('{');
      const endIndex = responseText.lastIndexOf('}') + 1;
      const jsonString = responseText.substring(startIndex, endIndex);
      extractedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      return res.status(500).json({ error: "AI returned an unexpected format. Please try again." });
    }

    res.status(200).json(extractedData);

  } catch (error) {
    console.error('Error during extraction:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

// --- CRUD Operations --- (Your correct CRUD logic)
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