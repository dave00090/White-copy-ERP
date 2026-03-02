import { createClient } from '@supabase/supabase-js';
import { Product, Client, Invoice } from '../types';

// Use the credentials already in your project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const Database = {
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) alert(`Error: ${error.message}`);
    return data || [];
  },
  saveProducts: async (products: Product[]) => {
    await supabase.from('products').upsert(products);
  },
  getClients: async (): Promise<Client[]> => {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) alert(`Error: ${error.message}`);
    return data || [];
  },
  saveClients: async (clients: Client[]) => {
    await supabase.from('clients').upsert(clients);
  },
  getInvoices: async (): Promise<Invoice[]> => {
    const { data, error } = await supabase.from('invoices').select('*');
    return data || [];
  },
  saveInvoices: async (invoices: Invoice[]) => {
    await supabase.from('invoices').upsert(invoices);
  }
};