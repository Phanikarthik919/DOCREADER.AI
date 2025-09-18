import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  headers: [String],
  rows: [[mongoose.Schema.Types.Mixed]],
  createdAt: { type: Date, default: Date.now },
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;