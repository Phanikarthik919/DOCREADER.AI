import { useState, useEffect, useRef } from 'react';
import { FullInvoice, LineItem } from './types';
import { API_URL } from './constants';

export const useInvoices = () => {
  const [savedInvoices, setSavedInvoices] = useState<FullInvoice[]>([]);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_URL}/invoices`);
      const data = await response.json();
      setSavedInvoices(data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return { savedInvoices, fetchInvoices };
};

export const useFileUpload = (
  setInvoiceData: React.Dispatch<React.SetStateAction<FullInvoice | null>>,
  createEmptyInvoice: (fileName: string) => FullInvoice
) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(URL.createObjectURL(file));
    setInvoiceData(createEmptyInvoice(file.name));
  };

  return { pdfUrl, uploadedFile, fileInputRef, handleFileUpload };
};