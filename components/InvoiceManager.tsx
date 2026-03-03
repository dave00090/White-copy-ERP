import React, { useState, useEffect } from 'react';
import { Invoice, Client, Product, InvoiceItem } from '../types';
import { Plus, Download, Eye, Search, Trash2, Printer, ShoppingCart, X, FileText, Filter, Calendar, Tag, DollarSign, Layers, CheckSquare, Square, CheckCircle2, ClipboardList, Wallet } from 'lucide-react';
import { generateDocumentPDF } from '../services/pdfService';

interface Props {
  invoices: Invoice[];
  clients: Client[];
  products: Product[];
  onCreateInvoice: (invoice: Invoice) => void;
}

const InvoiceManager: React.FC<Props> = ({ invoices, clients, products, onCreateInvoice }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [selectedType, setSelectedType] = useState<'Invoice' | 'Delivery Note'>('Invoice');

  // Filtering State
  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Partial' | 'Paid'>('All');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  // Single Invoice State
  const generateInitialInvNum = () => `INV-${Date.now().toString().slice(-6)}`;
  const generateInitialDNNum = () => `DN-${Date.now().toString().slice(-6)}`;

  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    invoiceNumber: generateInitialInvNum(),
    deliveryNoteNumber: generateInitialDNNum(),
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    clientId: '',
    clientName: ''
  });

  // Batch Invoicing State
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [batchItems, setBatchItems] = useState<InvoiceItem[]>([]);
  const [batchSearchTerm, setBatchSearchTerm] = useState('');
  
  // Item adding state (used for both single and batch)
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState(0);

  useEffect(() => {
    const product = products.find(p => p.id === selectedProduct);
    if (product) {
      setCustomPrice(product.sellingPrice);
    } else {
      setCustomPrice(0);
    }
  }, [selectedProduct, products]);

  const handleAddItem = (isBatch: boolean = false) => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const newItem: InvoiceItem = {
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: customPrice,
      totalPrice: customPrice * quantity,
      buyingPrice: product.buyingPrice 
    };

    if (isBatch) {
      setBatchItems(prev => [...prev, newItem]);
    } else {
      setNewInvoice(prev => ({
        ...prev,
        items: [...(prev.items || []), newItem]
      }));
    }
    setSelectedProduct('');
    setQuantity(1);
    setCustomPrice(0);
  };

  const handleRemoveItem = (index: number, isBatch: boolean = false) => {
    if (isBatch) {
      setBatchItems(prev => prev.filter((_, i) => i !== index));
    } else {
      setNewInvoice(prev => ({
        ...prev,
        items: prev.items?.filter((_, i) => i !== index)
      }));
    }
  };

  const handleCreate = () => {
    const subtotal = newInvoice.items?.reduce((acc, item) => acc + item.totalPrice, 0) || 0;
    const totalBuyingCost = newInvoice.items?.reduce((acc, item) => acc + (item.buyingPrice * item.quantity), 0) || 0;
    const profit = subtotal - totalBuyingCost;
    
    const client = clients.find(c => c.id === newInvoice.clientId);
    if (!client || !newInvoice.items?.length) return;
    
    onCreateInvoice({
      ...newInvoice as Invoice,
      id: Math.random().toString(36).substr(2, 9),
      clientName: client?.schoolName || 'Unknown School',
      subtotal,
      total: subtotal,
      profit,
      tax: 0,
      payments: [],
      status: 'Pending'
    });
    setShowCreateModal(false);
    setNewInvoice({
      invoiceNumber: generateInitialInvNum(),
      deliveryNoteNumber: generateInitialDNNum(),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [],
      clientId: '',
      clientName: ''
    });
  };

  const handleCreateBatch = () => {
    if (selectedClientIds.length === 0 || batchItems.length === 0) return;

    const baseTimestamp = Date.now();
    
    selectedClientIds.forEach((clientId, index) => {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      const subtotal = batchItems.reduce((acc, item) => acc + item.totalPrice, 0);
      const totalBuyingCost = batchItems.reduce((acc, item) => acc + (item.buyingPrice * item.quantity), 0);
      const profit = subtotal - totalBuyingCost;

      const batchInvoice: Invoice = {
        id: Math.random().toString(36).substr(2, 9),
        invoiceNumber: `INV-${baseTimestamp.toString().slice(-6)}${index}`,
        deliveryNoteNumber: `DN-${baseTimestamp.toString().slice(-6)}${index}`,
        clientId: client.id,
        clientName: client.schoolName,
        items: [...batchItems],
        subtotal,
        tax: 0,
        total: subtotal,
        profit,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        payments: [],
        status: 'Pending'
      };

      onCreateInvoice(batchInvoice);
    });

    setShowBatchModal(false);
    setSelectedClientIds([]);
    setBatchItems([]);
    alert(`Successfully generated ${selectedClientIds.length} invoices!`);
  };

  const toggleClientSelection = (id: string) => {
    setSelectedClientIds(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesClient = inv.clientName.toLowerCase().includes(filterClient.toLowerCase());
    const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;
    const matchesDateStart = !filterDateStart || inv.date >= filterDateStart;
    const matchesDateEnd = !filterDateEnd || inv.date <= filterDateEnd;
    return matchesClient && matchesStatus && matchesDateStart && matchesDateEnd;
  });

  const filteredBatchClients = clients.filter(c => 
    c.schoolName.toLowerCase().includes(batchSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Invoicing & Documents</h2>
          <p className="text-slate-500 text-xs font-bold uppercase mt-1">Manual Input & Professional Records</p>
        </div>
        <div className="flex gap-3">
          {/* ✅ Larger Touch Target applied */}
          <button 
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 md:py-2 rounded-xl font-bold border border-slate-700 transition-all text-sm md:text-base"
          >
            <Layers className="w-5 h-5" />
            <span>Batch Billing</span>
          </button>
          {/* ✅ Larger Touch Target applied */}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 md:py-2 rounded-xl font-bold transition-all text-sm md:text-base shadow-xl shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            <span>New Billing Entry</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Search className="w-3 h-3" /> School Search
          </label>
          <input 
            type="text" 
            placeholder="Search school name..." 
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500"
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Filter className="w-3 h-3" /> Status
          </label>
          <select 
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="All">All Transactions</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-3 h-3" /> From Date
          </label>
          <input 
            type="date" 
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500"
            value={filterDateStart}
            onChange={(e) => setFilterDateStart(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-3 h-3" /> To Date
          </label>
          <input 
            type="date" 
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500"
            value={filterDateEnd}
            onChange={(e) => setFilterDateEnd(e.target.value)}
          />
        </div>
      </div>

      {/* ✅ Responsive Table: scrollable container wrapping the table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto"> {/* Critical for mobile swiping */}
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700">Inv #</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700">School Client</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700">Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700">Amount</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-5 font-black text-blue-400">#{invoice.invoiceNumber}</td>
                  <td className="px-6 py-5">
                    <p className="font-bold text-white">{invoice.clientName}</p>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-400 font-medium">{invoice.date}</td>
                  <td className="px-6 py-5 font-black text-white">KES {invoice.total.toLocaleString()}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      invoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      invoice.status === 'Partial' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      {/* ✅ Larger Touch Target applied */}
                      <button 
                        onClick={() => setPreviewInvoice(invoice)}
                        className="p-3 md:p-2.5 bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
                        title="Preview"
                      >
                        <Eye className="w-5 h-5 md:w-4 md:h-4" />
                      </button>
                      {/* ✅ Larger Touch Target applied */}
                      <button 
                        onClick={() => generateDocumentPDF(invoice, 'Invoice')}
                        className="p-3 md:p-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl transition-all"
                        title="Download Invoice"
                      >
                        <FileText className="w-5 h-5 md:w-4 md:h-4" />
                      </button>
                      {/* ✅ Larger Touch Target applied */}
                      <button 
                        onClick={() => generateDocumentPDF(invoice, 'Delivery Note')}
                        className="p-3 md:p-2.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white rounded-xl transition-all"
                        title="Download Delivery Note"
                      >
                        <Printer className="w-5 h-5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showBatchModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[3rem] w-full max-w-6xl p-10 max-h-[95vh] overflow-hidden flex flex-col border border-slate-800 shadow-3xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Batch Billing Portal</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Generate multiple identical invoices across different schools</p>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="p-3 bg-slate-800 text-slate-500 hover:text-white rounded-2xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-slate-800/30 p-8 rounded-[2rem] border border-slate-700/50 flex flex-col">
                <h4 className="font-black text-white uppercase text-xs tracking-widest mb-6 flex items-center gap-3">
                  <Layers className="w-5 h-5 text-blue-500" /> 1. Select High Schools ({selectedClientIds.length})
                </h4>
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search schools..." 
                    className="w-full pl-12 pr-6 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-sm font-bold text-white outline-none focus:border-blue-500"
                    value={batchSearchTerm}
                    onChange={(e) => setBatchSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  <button 
                    onClick={() => setSelectedClientIds(selectedClientIds.length === clients.length ? [] : clients.map(c => c.id))}
                    className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all"
                  >
                    {selectedClientIds.length === clients.length ? 'Deselect All Schools' : 'Select All Schools'}
                  </button>
                  {filteredBatchClients.map(client => (
                    <button 
                      key={client.id}
                      onClick={() => toggleClientSelection(client.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        selectedClientIds.includes(client.id) 
                          ? 'bg-blue-600/10 border-blue-500 text-white' 
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-sm font-bold truncate pr-4">{client.schoolName}</span>
                      {selectedClientIds.includes(client.id) ? <CheckSquare className="w-5 h-5 text-blue-500" /> : <Square className="w-5 h-5" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 bg-slate-800/30 p-8 rounded-[2rem] border border-slate-700/50 flex flex-col">
                <h4 className="font-black text-white uppercase text-xs tracking-widest mb-6 flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-blue-500" /> 2. Compose Unified Item List
                </h4>
                
                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-700/50 mb-8">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-3">Product</label>
                      <select 
                        className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl font-bold outline-none"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                      >
                        <option value="">Choose...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-3">Price (KES)</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl font-bold outline-none" 
                        value={customPrice}
                        onChange={(e) => setCustomPrice(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-3">Qty</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl font-bold outline-none" 
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                      />
                    </div>
                    {/* ✅ Larger Touch Target applied */}
                    <button 
                      onClick={() => handleAddItem(true)}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 md:py-2 rounded-xl font-bold transition-all text-sm md:text-base"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add to Batch</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 mb-8">
                  {batchItems.length > 0 ? batchItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-900 p-5 rounded-2xl border border-slate-800">
                      <div className="flex gap-4 items-center">
                        <span className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-500 rounded-xl text-xs font-black">{idx + 1}</span>
                        <div>
                          <p className="font-bold text-white">{item.productName}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.quantity} UNITS @ KES {item.unitPrice.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <p className="font-black text-white text-lg">KES {item.totalPrice.toLocaleString()}</p>
                        <button onClick={() => handleRemoveItem(idx, true)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-[2rem]">
                      <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">No items added to batch yet</p>
                    </div>
                  )}
                </div>

                <div className="pt-8 border-t border-slate-700 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Batch Summary</p>
                    <p className="text-sm font-bold text-white">
                      Generating <span className="text-blue-500">{selectedClientIds.length}</span> Invoices @ <span className="text-emerald-400">KES {batchItems.reduce((a, b) => a + b.totalPrice, 0).toLocaleString()}</span> each
                    </p>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => setShowBatchModal(false)} className="px-8 py-4 border border-slate-700 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800">Discard Batch</button>
                     {/* ✅ Larger Touch Target applied */}
                     <button 
                        disabled={selectedClientIds.length === 0 || batchItems.length === 0}
                        onClick={handleCreateBatch}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white px-4 py-3 md:py-2 rounded-xl font-bold transition-all text-sm md:text-base shadow-xl shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Process & Create All</span>
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[3rem] w-full max-w-5xl p-10 max-h-[95vh] overflow-y-auto border border-slate-800 shadow-3xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Manual Billing Entry</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-3 bg-slate-800 text-slate-500 hover:text-white rounded-2xl">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">School Name</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-800 text-white border border-slate-700 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/20"
                  onChange={(e) => setNewInvoice({...newInvoice, clientId: e.target.value})}
                  value={newInvoice.clientId}
                >
                  <option value="">Select School...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.schoolName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Invoice No.</label>
                <input 
                  type="text" 
                  placeholder="e.g. INV-2024-001"
                  className="w-full px-6 py-4 bg-slate-800 text-white border border-slate-700 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/20"
                  value={newInvoice.invoiceNumber}
                  onChange={(e) => setNewInvoice({...newInvoice, invoiceNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">D/Note No.</label>
                <input 
                  type="text" 
                  placeholder="e.g. DN-2024-001"
                  className="w-full px-6 py-4 bg-slate-800 text-white border border-slate-700 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/20"
                  value={newInvoice.deliveryNoteNumber}
                  onChange={(e) => setNewInvoice({...newInvoice, deliveryNoteNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Document Date</label>
                <input 
                  type="date" 
                  className="w-full px-6 py-4 bg-slate-800 text-white border border-slate-700 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/20"
                  value={newInvoice.date}
                  onChange={(e) => setNewInvoice({...newInvoice, date: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-slate-800/50 p-8 rounded-[2rem] border border-slate-700/50 mb-10">
              <h4 className="font-black mb-6 flex items-center gap-3 text-white uppercase text-xs tracking-widest">
                <ShoppingCart className="w-5 h-5 text-blue-500" /> Line Items Selection (Negotiable Pricing)
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
                <div className="lg:col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-3">Product / Part</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-900 text-white border border-slate-700 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/20"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Choose item...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="w-full">
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <DollarSign className="w-3 h-3 text-emerald-400" /> Negotiated Unit Price
                  </label>
                  <input 
                    type="number" 
                    className="w-full px-6 py-4 bg-slate-900 text-white border border-slate-700 rounded-2xl font-black text-xl outline-none focus:ring-4 focus:ring-emerald-500/20" 
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                  />
                </div>
                <div className="w-full">
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-3">Qty</label>
                  <input 
                    type="number" 
                    className="w-full px-6 py-4 bg-slate-900 text-white border border-slate-700 rounded-2xl font-black text-center" 
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
                {/* ✅ Larger Touch Target applied */}
                <button 
                  onClick={() => handleAddItem(false)}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 md:py-2 rounded-xl font-bold transition-all text-sm md:text-base shadow-lg shadow-blue-500/20"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="mt-8 space-y-3">
                {newInvoice.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900 p-5 rounded-2xl border border-slate-800">
                    <div className="flex gap-4 items-center">
                      <span className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-500 rounded-xl text-xs font-black">{idx + 1}</span>
                      <div>
                        <p className="font-bold text-white">{item.productName}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.quantity} UNITS @ KES {item.unitPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <p className="font-black text-white text-lg">KES {item.totalPrice.toLocaleString()}</p>
                      <button onClick={() => handleRemoveItem(idx, false)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end border-t border-slate-800 pt-10 gap-6">
              <div className="text-slate-500 text-xs font-medium max-w-sm">
                <p className="mt-2 text-[10px] uppercase font-bold tracking-tight">System allows price negotiation per client while tracking margins.</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Total Payable Amount</p>
                <p className="text-5xl font-black text-white">KES {(newInvoice.items?.reduce((a, b) => a + b.totalPrice, 0) || 0).toLocaleString()}</p>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setShowCreateModal(false)} className="px-10 py-4 border border-slate-700 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800">Discard</button>
                  {/* ✅ Larger Touch Target applied */}
                  <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 md:py-2 rounded-xl font-bold transition-all text-sm md:text-base shadow-2xl shadow-blue-500/40"
                  >
                    <span>Finalize & Save</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewInvoice && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[3rem] w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-800 shadow-3xl">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
              <div>
                <h3 className="font-black text-xl uppercase tracking-tighter">Document Preview & Tracking</h3>
                <div className="flex gap-4 mt-2">
                  <button 
                    onClick={() => setSelectedType('Invoice')}
                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all border ${selectedType === 'Invoice' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                  >
                    Invoice View
                  </button>
                  <button 
                    onClick={() => setSelectedType('Delivery Note')}
                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all border ${selectedType === 'Delivery Note' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                  >
                    Delivery Note View
                  </button>
                </div>
              </div>
              <button onClick={() => setPreviewInvoice(null)} className="p-3 bg-slate-800 text-slate-500 hover:text-white rounded-2xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden flex bg-slate-950">
              {/* Printed Document Preview */}
              <div className="flex-1 overflow-y-auto p-12 bg-slate-950 flex justify-center">
                <div className="bg-white p-12 shadow-2xl text-slate-900 min-h-[900px] w-full max-w-[800px] rounded-lg">
                  <div className="text-center mb-10">
                    <span className="inline-block px-8 py-2 rounded-full font-black text-xs uppercase tracking-[0.3em] mb-6 bg-[#1E407C] text-white">
                      {selectedType === 'Invoice' ? 'INVOICE' : 'DELIVERY NOTE'}
                    </span>
                    <h1 className="text-4xl font-black tracking-tighter text-[#1E407C]">WHITE COPY ENTERPRISES</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-widest">Dealers in, Repair of office equipment, Riso, Ricoh and Photocopiers</p>
                  </div>

                  <div className="grid grid-cols-2 gap-10 mb-12">
                    <div className="border border-[#1E407C] p-6 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-3">M/s School</p>
                        <p className="font-black text-xl">{previewInvoice.clientName}</p>
                        <p className="text-sm text-slate-600 font-medium tracking-tight">Kenyan High School Portfolio</p>
                    </div>
                    <div className="border border-[#1E407C] p-6 rounded-2xl">
                        <p className="text-sm font-bold flex justify-between mb-2 text-slate-600"><span>Date:</span> <span className="text-slate-900">{previewInvoice.date}</span></p>
                        <p className="text-sm font-bold flex justify-between mb-2 text-slate-600"><span>Inv No:</span> <span className="text-slate-900">#{previewInvoice.invoiceNumber}</span></p>
                        <p className="text-sm font-bold flex justify-between text-slate-600"><span>Ref No:</span> <span className="text-slate-900">{previewInvoice.deliveryNoteNumber}</span></p>
                    </div>
                  </div>

                  {/* ✅ Responsive Table: scrollable container wrapping the preview table */}
                  <div className="overflow-x-auto">
                    <table className="w-full mb-12 border border-[#1E407C] min-w-[400px]">
                      <thead className="bg-white border-b border-[#1E407C]">
                        <tr className="text-left text-xs font-black uppercase tracking-widest text-black">
                          <th className="py-4 px-4 border-r border-[#1E407C]">Qty</th>
                          <th className="py-4 px-4 border-r border-[#1E407C]">Particular Description</th>
                          {selectedType === 'Invoice' && <th className="py-4 px-4 border-r border-[#1E407C] text-right">@ Unit</th>}
                          {selectedType === 'Invoice' && <th className="py-4 px-4 text-right">Total</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewInvoice.items.map((item, i) => (
                          <tr key={i}>
                            <td className="py-4 px-4 border-r border-[#1E407C] font-black text-black">{item.quantity}</td>
                            <td className="py-4 px-4 border-r border-[#1E407C] font-bold text-slate-700">{item.productName}</td>
                            {selectedType === 'Invoice' && <td className="py-4 px-4 border-r border-[#1E407C] text-right font-bold text-slate-500">{item.unitPrice.toLocaleString()}</td>}
                            {selectedType === 'Invoice' && <td className="py-4 px-4 text-right font-black text-black">KES {item.totalPrice.toLocaleString()}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {selectedType === 'Invoice' && (
                    <div className="flex justify-between pt-6 border-t border-[#1E407C]">
                      <p className="text-xs font-bold text-slate-500 italic">E.&O.E. No.</p>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount Payable</p>
                        <p className="text-4xl font-black text-black">KES {previewInvoice.total.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar: Financial Tracking Details */}
              <div className="w-96 border-l border-slate-800 bg-slate-900/50 p-8 overflow-y-auto">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-blue-500" /> Financial Tracking
                </h4>
                
                <div className="space-y-6">
                  <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Invoice Status</p>
                    <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase text-center border ${
                      previewInvoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      previewInvoice.status === 'Partial' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {previewInvoice.status}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Payment History</p>
                    <div className="space-y-3">
                      {previewInvoice.payments.length > 0 ? previewInvoice.payments.map((p, idx) => (
                        <div key={idx} className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                           <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-black text-blue-400 uppercase">{p.method}</span>
                             <span className="text-[10px] font-bold text-slate-500">{p.date}</span>
                           </div>
                           <p className="text-sm font-black text-white">KES {p.amount.toLocaleString()}</p>
                           {p.reference && (
                             <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center gap-2">
                               <Tag className="w-3 h-3 text-emerald-500" />
                               <span className="text-[10px] font-bold text-emerald-400 truncate">{p.reference}</span>
                             </div>
                           )}
                        </div>
                      )) : (
                        <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl">
                          <p className="text-[10px] font-black text-slate-600 uppercase">No payments yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 border-t border-slate-800 flex justify-end gap-4 bg-slate-900">
              {/* ✅ Larger Touch Target applied */}
              <button 
                onClick={() => generateDocumentPDF(previewInvoice, selectedType)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 md:py-2 rounded-xl font-bold transition-all text-sm md:text-base shadow-xl shadow-blue-500/20"
              >
                <Download className="w-5 h-5" />
                <span>Download {selectedType} (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManager;