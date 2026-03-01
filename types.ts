
export interface Product {
  id: string;
  name: string;
  category: 'Printer' | 'Spare Part' | 'Ink' | 'Master' | 'Service';
  buyingPrice: number;
  sellingPrice: number;
  stockCount: number;
  lowStockThreshold: number;
}

export interface Client {
  id: string;
  schoolName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  totalDebt: number;
  totalPaid: number;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  buyingPrice: number; // Stored at time of invoice for accurate historical profit
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string; // This will store 'Cash', 'Bank Transfer', 'Cheque', 'M-Pesa', etc.
  reference?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  deliveryNoteNumber: string;
  clientId: string;
  clientName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  profit: number;
  date: string;
  dueDate: string;
  payments: Payment[];
  status: 'Pending' | 'Partial' | 'Paid';
}
