'use client';

import { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, ScanSearch, FilePenLine, Sparkles, Save, Bell, Trash2, Gem, TableIcon, PlusCircle, BrainCircuit, Download, UserCircle, AlignJustify
} from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Types ---
interface LineItem {
  id: string;
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}
interface FullInvoice {
  _id?: string;
  fileName: string;
  vendor: { name: string; address: string; taxId: string };
  invoice: { number: string; date: string; currency: string; subtotal: number; taxPercent: number; total: number; poNumber: string; poDate: string };
  lineItems: LineItem[];
  createdAt?: string;
}

// Logo
const DocReaderLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="20" fill="url(#logo-gradient)"/>
    <defs>
      <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7C3AED"/>
        <stop offset="100%" stopColor="#06B6D4"/>
      </linearGradient>
    </defs>
    <path d="M12 28L12 8H28V28C28 29.1 27.1 30 26 30H14C12.9 30 12 29.1 12 28Z" fill="white" stroke="#7C3AED" strokeWidth="1"/>
    <path d="M16 24H24V26H16V24Z" fill="#7C3AED"/>
  </svg>
);

// Empty invoice helper
const createEmptyInvoice = (fileName: string): FullInvoice => ({
  fileName,
  vendor: { name: '', address: '', taxId: '' },
  invoice: { number: '', date: '', currency: '$', subtotal: 0, taxPercent: 0, total: 0, poNumber: '', poDate: '' },
  lineItems: [{ id: crypto.randomUUID(), description: '', unitPrice: 0, quantity: 1, total: 0 }]
});

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [invoiceData, setInvoiceData] = useState<FullInvoice | null>(null);
  const [savedInvoices, setSavedInvoices] = useState<FullInvoice[]>([]);
  const [aiProvider, setAiProvider] = useState('gemini');
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('http://localhost:3001/invoices');
      const data = await response.json();
      setSavedInvoices(data);
    } catch (error) { console.error("Failed to fetch invoices:", error); }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(URL.createObjectURL(file));
    setInvoiceData(createEmptyInvoice(file.name));
  };

  const handleExtract = async () => {
    if (!uploadedFile) return alert("Please upload a file first.");
    setIsExtracting(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('provider', aiProvider);
    try {
      const response = await fetch('http://localhost:3001/extract', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Extraction failed');
      
      const extractedLineItems = data.lineItems.map((item: any) => ({
        ...item,
        id: item.id || crypto.randomUUID(),
        total: Number(item.quantity) * Number(item.unitPrice)
      }));
      
      setInvoiceData({ 
        ...data, 
        fileName: uploadedFile.name,
        lineItems: extractedLineItems
      });

    } catch (error: any) { 
      alert(`Error: ${error.message}`); 
    } finally { 
      setIsExtracting(false); 
    }
  };

  const handleSaveInvoice = async () => {
    if (!invoiceData) return alert("No invoice to save.");
    try {
      const response = await fetch('http://localhost:3001/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(invoiceData) });
      if (!response.ok) throw new Error('Failed to save invoice.');
      await fetchInvoices();
      alert("Invoice saved!");
    } catch (error) { console.error(error); }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm("Delete this invoice?")) return;
    try {
      const response = await fetch(`http://localhost:3001/invoices/${invoiceId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed.');
      await fetchInvoices();
    } catch (error) { console.error(error); }
  };

  const handleDownloadPdf = () => {
    if (!invoiceData) return;
    const doc = new jsPDF();
    const { vendor, invoice, lineItems } = invoiceData;
    doc.setProperties({ title: `Invoice ${invoice.number}` });
    doc.setFontSize(22);
    doc.text("INVOICE", 105, 20, { align: "center" });
    doc.setFontSize(11);
    doc.text(`From:\n${vendor.name}\n${vendor.address}`, 14, 40);
    doc.text(`Invoice #: ${invoice.number}\nDate: ${invoice.date}`, 196, 40, { align: "right" });

    autoTable(doc, {
      head: [["Description", "Qty", "Unit Price", "Total"]],
      headStyles: { halign: 'center' },
      body: lineItems.map(li => [li.description, li.quantity, li.unitPrice.toFixed(2), li.total.toFixed(2)]),
      startY: 70
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.text(`TOTAL: ${invoice.currency}${invoice.total.toFixed(2)}`, 196, finalY + 10, { align: "right" });
    doc.save(`Invoice-${invoice.number}.pdf`);
  };

  const handleFormChange = (section: 'vendor' | 'invoice', field: string, value: string | number) => {
    if (!invoiceData) return;
    setInvoiceData({ ...invoiceData, [section]: { ...invoiceData[section], [field]: value } });
  };

  const handleLineItemChange = (index: number, field: keyof Omit<LineItem, 'id' | 'total'>, value: string | number) => {
    if (!invoiceData) return;
    const updated = [...invoiceData.lineItems];
    (updated[index] as any)[field] = value;
    updated[index].total = Number(updated[index].quantity) * Number(updated[index].unitPrice);
    setInvoiceData({ ...invoiceData, lineItems: updated });
  };

  const addLineItem = () => {
    if (!invoiceData) return;
    setInvoiceData({
      ...invoiceData,
      lineItems: [...invoiceData.lineItems, { id: crypto.randomUUID(), description: '', unitPrice: 0, quantity: 1, total: 0 }]
    });
  };

  const removeLineItem = (id: string) => {
    if (!invoiceData || invoiceData.lineItems.length <= 1) return;
    setInvoiceData({ ...invoiceData, lineItems: invoiceData.lineItems.filter(item => item.id !== id) });
  };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className={`w-72 md:flex flex-col p-6 border-r transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="flex items-center gap-3 mb-10 overflow-hidden">
          <DocReaderLogo />
          {!isSidebarCollapsed && <h1 className="text-2xl font-bold">DOCREADER</h1>}
        </div>
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-3 mb-8">
            <img src="https://placehold.co/40x40" alt="User" className="w-10 h-10 rounded-full"/>
            <div>
              <p className="font-semibold">Phani</p>
              <p className="text-xs">Pro Member</p>
            </div>
          </div>
        )}
        <div className={`mt-auto transition-all duration-300 ${isSidebarCollapsed ? 'w-full' : ''}`}>
          <button className={`w-full flex items-center gap-2 p-2 bg-purple-600 text-white rounded justify-center ${isSidebarCollapsed ? '' : 'justify-start'}`}>
            <Gem className="w-4 h-4"/>
            {!isSidebarCollapsed && <span className="pl-1">Upgrade</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-6 border-b sticky top-0 z-10">
          <button onClick={toggleSidebar} className="p-2 rounded hover:bg-gray-100 md:hidden"><AlignJustify className="h-6 w-6"/></button>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <div className="flex items-center gap-2 relative">
            <button onClick={()=>setShowBellDropdown(!showBellDropdown)} className="p-2 rounded hover:bg-gray-100"><Bell className="h-5 w-5"/></button>
            {showBellDropdown && <div className="absolute right-0 mt-12 w-64 p-2 rounded-xl border shadow-lg bg-white">Notifications...</div>}
            <button onClick={()=>setShowProfileDropdown(!showProfileDropdown)} className="p-2 rounded hover:bg-gray-100"><UserCircle className="h-6 w-6"/></button>
            {showProfileDropdown && <div className="absolute right-0 mt-12 w-48 p-2 rounded-xl border shadow-lg bg-white">Profile...</div>}
          </div>
        </header>

        <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
          <PanelGroup direction="horizontal" className="flex-1 min-h-[60vh]">
            <Panel defaultSize={65} minSize={30}>
              <div className="w-full h-full flex flex-col rounded-2xl border overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><ScanSearch className="w-5 h-5"/> Document Viewer</h3>
                  <button onClick={()=>fileInputRef.current?.click()} className="px-3 py-1 bg-gray-200 rounded text-dark">Upload</button>
                </div>
                <div className="flex-1 p-4">
                  {pdfUrl ? <iframe src={pdfUrl} title="PDF Preview" className="w-full h-full border-0 rounded-2xl"/> :
                  <div className="w-full h-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed"><UploadCloud className="w-16 h-16 mb-4"/><p className="font-semibold text-lg">Upload a document</p></div>}
                  <input ref={fileInputRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={handleFileUpload}/>
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-2 flex items-center justify-center group"><div className="w-1 h-10 rounded-full group-hover:opacity-80 bg-gray-300"/></PanelResizeHandle>

            <Panel defaultSize={35} minSize={25}>
              <div className="w-full h-full flex flex-col rounded-2xl border overflow-hidden">
                <div className="p-4 border-b"><h3 className="text-lg font-semibold flex items-center gap-2"><FilePenLine className="w-5 h-5"/> Data Extraction</h3></div>
                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                  {/* AI Provider */}
                  <div className="flex gap-4">
                    <label className="text-dark"><input type="radio" checked={aiProvider==='gemini'} onChange={()=>setAiProvider('gemini')}/> Gemini</label>
                    <label className="text-dark"><input type="radio" checked={aiProvider==='groq'} onChange={()=>setAiProvider('groq')}/> Groq</label>
                  </div>

                  {!invoiceData ? <div className="text-center pt-10">Upload and extract data to see the form.</div> :
                  <div className="space-y-4">
                    <h4 className="font-semibold pt-4">Vendor</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <input className="border p-1 rounded text-dark placeholder-dark" placeholder="Name" value={invoiceData.vendor.name} onChange={e=>handleFormChange('vendor','name', e.target.value)}/>
                      <input className="border p-1 rounded text-dark placeholder-dark" placeholder="Tax ID" value={invoiceData.vendor.taxId} onChange={e=>handleFormChange('vendor','taxId', e.target.value)}/>
                      <input className="border p-1 rounded col-span-2 text-dark placeholder-dark" placeholder="Address" value={invoiceData.vendor.address} onChange={e=>handleFormChange('vendor','address', e.target.value)}/>
                    </div>

                    <h4 className="font-semibold pt-4">Invoice</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <input className="border p-1 rounded text-dark placeholder-dark" placeholder="Number" value={invoiceData.invoice.number} onChange={e=>handleFormChange('invoice','number', e.target.value)}/>
                      <input className="border p-1 rounded text-dark placeholder-dark" placeholder="Date" value={invoiceData.invoice.date} onChange={e=>handleFormChange('invoice','date', e.target.value)}/>
                      <input className="border p-1 rounded text-dark placeholder-dark" placeholder="Total" type="number" value={invoiceData.invoice.total} onChange={e=>handleFormChange('invoice','total', parseFloat(e.target.value))}/>
                      <input className="border p-1 rounded text-dark placeholder-dark" placeholder="Currency" value={invoiceData.invoice.currency} onChange={e=>handleFormChange('invoice','currency', e.target.value)}/>
                    </div>

                    {/* Line Items Table */}
                    <h4 className="font-semibold pt-4 flex justify-between items-center">Line Items
                      <button onClick={addLineItem} className="flex items-center gap-1 text-blue-600"><PlusCircle className="w-4 h-4"/> Add</button>
                    </h4>
                    <table className="w-full border-collapse border border-gray-300 text-center text-dark">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="border p-2">Description</th>
                          <th className="border p-2">Quantity</th>
                          <th className="border p-2">Unit Price</th>
                          <th className="border p-2">Total</th>
                          <th className="border p-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.lineItems.map((item, index) => (
                          <tr key={item.id}>
                            <td className="border p-1">
                              <input className="w-full text-center text-current placeholder-dark" value={item.description} onChange={e=>handleLineItemChange(index,'description', e.target.value)}/>
                            </td>
                            <td className="border p-1">
                              <input type="number" className="w-full text-center text-current" value={item.quantity} onChange={e=>handleLineItemChange(index,'quantity', parseFloat(e.target.value))}/>
                            </td>
                            <td className="border p-1">
                              <input type="number" className="w-full text-center text-current" value={item.unitPrice} onChange={e=>handleLineItemChange(index,'unitPrice', parseFloat(e.target.value))}/>
                            </td>
                            <td className="border p-1 text-white">{item.total.toFixed(2)}</td>
                            <td className="border p-1">
                              <button className="text-red-600" onClick={()=>removeLineItem(item.id)}>
                                <Trash2 className="w-4 h-4 mx-auto"/>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>}
                </div>

                {/* Bottom Buttons */}
                <div className="p-6 border-t grid gap-4">
                  <button onClick={handleExtract} disabled={isExtracting || !uploadedFile} className="w-full py-3 bg-purple-600 text-white rounded flex justify-center items-center gap-2">{isExtracting ? <BrainCircuit className="animate-spin h-5 w-5"/> : <Sparkles className="w-5 h-5"/>} Extract with AI</button>
                  <div className="flex gap-4">
                    <button onClick={handleSaveInvoice} disabled={!invoiceData} className="w-full py-2 bg-green-600 text-white rounded flex justify-center items-center gap-1"><Save className="w-4 h-4"/> Save</button>
                    <button onClick={handleDownloadPdf} disabled={!invoiceData} className="w-full py-2 bg-blue-600 text-white rounded flex justify-center items-center gap-1"><Download className="w-4 h-4"/> Download</button>
                  </div>
                </div>
              </div>
            </Panel>
          </PanelGroup>

          {/* Saved Invoices */}
          <div className="rounded-2xl border overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2 text-dark"><TableIcon className="w-5 h-5"/> Saved Invoices</div>
            <table className="w-full table-auto border-collapse border border-gray-300 text-center text-dark">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Vendor</th>
                  <th className="p-2 border">Invoice #</th>
                  <th className="p-2 border">Total</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {savedInvoices.map(inv => (
                  <tr key={inv._id} className="border-t">
                    <td className="p-2 border">{inv.vendor ? inv.vendor.name : 'N/A'}</td>
                    <td className="p-2 border">{inv.invoice ? inv.invoice.number : 'N/A'}</td>
                    <td className="p-2 border">{inv.invoice ? `${inv.invoice.total} ${inv.invoice.currency}` : 'N/A'}</td>
                    <td className="p-2 border">{inv.invoice ? inv.invoice.date : 'N/A'}</td>
                    <td className="p-2 border">
                      <button className="text-red-600" onClick={() => handleDeleteInvoice(inv._id!)}><Trash2 className="w-4 h-4 mx-auto"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}