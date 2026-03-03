import { createClient } from '@supabase/supabase-js';
import { Product, Client, Invoice } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const Database = {
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
      alert("Cloud Fetch Failed: " + error.message);
    }
    return data || [];
  },
  saveProducts: async (products: Product[]) => {
    const { error } = await supabase.from('products').upsert(products);
    if (error) alert("Cloud Save Failed: " + error.message);
  },
  
  getClients: async (): Promise<Client[]> => {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) alert("Cloud Fetch Failed: " + error.message);
    return data || [];
  },
  saveClients: async (clients: Client[]) => {
    const { error } = await supabase.from('clients').upsert(clients);
    if (error) alert("Cloud Save Failed: " + error.message);
  },
  
  getInvoices: async (): Promise<Invoice[]> => {
    const { data, error } = await supabase.from('invoices').select('*');
    if (error) alert("Cloud Fetch Failed: " + error.message);
    return data || [];
  },
  saveInvoices: async (invoices: Invoice[]) => {
    const { error } = await supabase.from('invoices').upsert(invoices);
    if (error) alert("Cloud Save Failed: " + error.message);
  },
};