
import { Product, Client, Invoice } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'wc_products',
  CLIENTS: 'wc_clients',
  INVOICES: 'wc_invoices'
};

export const getStoredData = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

export const setStoredData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const Database = {
  getProducts: () => getStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, []),
  saveProducts: (products: Product[]) => setStoredData(STORAGE_KEYS.PRODUCTS, products),
  
  getClients: () => getStoredData<Client[]>(STORAGE_KEYS.CLIENTS, []),
  saveClients: (clients: Client[]) => setStoredData(STORAGE_KEYS.CLIENTS, clients),
  
  getInvoices: () => getStoredData<Invoice[]>(STORAGE_KEYS.INVOICES, []),
  saveInvoices: (invoices: Invoice[]) => setStoredData(STORAGE_KEYS.INVOICES, invoices),
};
