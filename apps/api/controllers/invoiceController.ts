import { Request, Response } from 'express';
import Invoice from '../models/invoiceModel'; // <-- CORRECTED PATH: From '../src/models' to '../models'
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdf from 'pdf-parse';

// --- THE ROBUST AI EXTRACTION FUNCTION ---
export const extractData = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file was uploaded.' });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze the document provided (image or text). Identify the main table of data.
      Extract the column headers and all the rows of data from that table.
      Return the answer ONLY as a valid JSON object with this exact structure:
      {
        "headers": ["Header 1", "Header 2", ...],
        "rows": [
          ["Row 1 Cell 1", "Row 1 Cell 2", ...],
          ["Row 2 Cell 1", "Row 2 Cell 2", ...]
        ]
      }
      Do not include any other text, markdown, or explanations.
    `;

    let result;
    if (req.file.mimetype.startsWith('image/')) {
      const imagePart = { inlineData: { data: req.file.buffer.toString("base64"), mimeType: req.file.mimetype } };
      result = await model.generateContent([prompt, imagePart]);
    } else if (req.file.mimetype === 'application/pdf') {
      const data = await pdf(req.file.buffer);
      if (!data.text) return res.status(400).json({ error: 'Could not read text from the PDF.' });
      result = await model.generateContent(prompt + "\n\nDocument Text:\n---\n" + data.text);
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
        console.error("Failed to parse AI response. The response was:", responseText);
        return res.status(500).json({ error: "AI returned an unexpected format. Please try again." });
    }

    res.status(200).json(extractedData);

  } catch (error) {
    console.error('Error during extraction:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
};

// --- CRUD FUNCTIONS ---
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const newInvoice = new Invoice(req.body);
    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (error) { res.status(400).json({ error: "Failed to save invoice.", details: error }); }
};

export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) { res.status(500).json({ error: "Failed to retrieve invoices." }); }
};

export const deleteInvoice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedInvoice = await Invoice.findByIdAndDelete(id);
        if (!deletedInvoice) return res.status(404).json({ error: "Invoice not found." });
        res.status(200).json({ message: "Invoice deleted successfully." });
    } catch (error) { res.status(500).json({ error: "Failed to delete invoice." }); }
};