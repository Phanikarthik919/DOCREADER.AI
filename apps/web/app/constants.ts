import {
    UploadCloud, ScanSearch, FilePenLine, Sparkles, Save, Bell, Trash2, Gem, TableIcon, PlusCircle, BrainCircuit, Download, UserCircle, AlignJustify
  } from 'lucide-react';
  
  export const ICONS = {
    UploadCloud,
    ScanSearch,
    FilePenLine,
    Sparkles,
    Save,
    Bell,
    Trash2,
    Gem,
    TableIcon,
    PlusCircle,
    BrainCircuit,
    Download,
    UserCircle,
    AlignJustify,
  };
  
  export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  export const EMPTY_INVOICE = {
    fileName: '',
    vendor: { name: '', address: '', taxId: '' },
    invoice: { number: '', date: '', currency: '$', subtotal: 0, taxPercent: 0, total: 0, poNumber: '', poDate: '' },
    lineItems: [{ id: '', description: '', unitPrice: 0, quantity: 1, total: 0 }],
  };
  
  export const NAV_ITEMS = [
    { icon: ScanSearch, text: 'Dashboard' },
    { icon: TableIcon, text: 'Invoices' },
  ];