import React, { useState } from 'react';
import { Client, Invoice, Payment } from '../types';
import { Search, Plus, Phone, School, Wallet, History, ArrowDownLeft, X, Receipt, Users, AlertCircle, CheckCircle2, TrendingUp, DollarSign, Calendar, CreditCard, Tag, ClipboardList } from 'lucide-react';

interface Props {
  clients: Client[];
  invoices: Invoice[];
  onAddClient: (client: Client) => void;
  onAddPayment: (clientId: string, payment: Payment) => void;
  onDeleteClient: (clientId: string) => void; // Added
}

const ClientManager: React.FC<Props> = ({ clients, invoices, onAddClient, onAddPayment, onDeleteClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [newClient, setNewClient] = useState({
    schoolName: '',
    contactPerson: '',
    phoneNumber: ''
  });

  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentReference, setPaymentReference] = useState('');

  const filteredClients = clients.filter(c => 
    c.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = () => {
    if (!newClient.schoolName) return;
    onAddClient({
      id: Math.random().toString(36).substr(2, 9),
      ...newClient,
      email: '', 
      totalDebt: 0,
      totalPaid: 0
    });
    setShowAddModal(false);
    setNewClient({ schoolName: '', contactPerson: '', phoneNumber: '' });
  };

  const handleAddPayment = () => {
    if (!selectedClient || paymentAmount <= 0) return;
    onAddPayment(selectedClient.id, {
      id: Math.random().toString(36).substr(2, 9),
      amount: Number(paymentAmount),
      date: new Date().toISOString().split('T')[0],
      method: paymentMethod,
      reference: paymentReference
    });
    setShowPaymentModal(false);
    setPaymentAmount(0);
    setPaymentMethod('Cash');
    setPaymentReference('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">School Portfolio</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Kenyan High Schools Network</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search school name..." 
              className="pl-12 pr-6 py-3 bg-slate-800 text-white border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-80 shadow-2xl transition-all font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 md:py-2 rounded-xl font-bold transition-all text-sm md:text-base"
          >
            <Plus className="w-5 h-5" />
            <span>Register School</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredClients.map(client => {
          const balance = client.totalDebt - client.totalPaid;
          const paidPercentage = client.totalDebt > 0 ? (client.totalPaid / client.totalDebt) * 100 : 0;
          
          return (
            <div key={client.id} className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden group hover:border-slate-500 transition-all">
              <div className="p-8">
                <div className="flex justify-between items-start">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700">
                    <School className="w-8 h-8 text-blue-500" />
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${balance > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'}`}>
                    {balance > 0 ? `${paidPercentage.toFixed(0)}% Paid` : 'Fully Paid'}
                  </span>
                </div>
                <h3 className="mt-6 font-black text-xl text-white truncate">{client.schoolName}</h3>
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-slate-400 flex items-center gap-3 font-medium"><Users className="w-4 h-4 text-slate-600" /> {client.contactPerson}</p>
                  <p className="text-sm text-slate-400 flex items-center gap-3 font-medium"><Phone className="w-4 h-4 text-slate-600" /> {client.phoneNumber}</p>
                </div>

                {/* Progress Bar Representation */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Progress</p>
                    <p className="text-[10px] font-black text-slate-300">{paidPercentage.toFixed(1)}%</p>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                    <div 
                      className={`h-full transition-all duration-1000 ${balance > 0 ? 'bg-blue-500' : 'bg-emerald-500'}`}
                      style={{ width: `${paidPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-700/50 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Paid</p>
                    <p className="text-sm font-black text-emerald-400">
                      KES {client.totalPaid.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Outstanding</p>
                    <p className={`text-sm font-black ${balance > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      KES {balance.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  {/* Delete Button */}
                  <button 
                    onClick={() => onDeleteClient(client.id)}
                    className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                    title="Delete School"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setSelectedClient(client)}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-slate-400 hover:bg-slate-700 hover:text-white px-4 py-3 md:py-2 rounded-xl font-bold transition-all text-sm md:text-base"
                  >
                    <History className="w-5 h-5" />
                    <span>Statement</span>
                  </button>
                  <button 
                    onClick={() => { setSelectedClient(client); setShowPaymentModal(true); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 md:py-2 rounded-xl font-bold transition-all text-sm md:text-base shadow-lg shadow-blue-500/20"
                  >
                    <Wallet className="w-5 h-5" />
                    <span>Payment</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedClient && !showPaymentModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-800 shadow-3xl">
            <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h3 className="text-3xl font-black text-white">{selectedClient.schoolName}</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Comprehensive Financial Statement</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="p-3 bg-slate-800 text-slate-500 hover:text-white rounded-2xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-slate-800/80 p-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-700">
               <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-blue-500/20 shadow-xl">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><TrendingUp className="w-6 h-6" /></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Amount Billed</p>
                  </div>
                  <p className="text-3xl font-black text-white">KES {selectedClient.totalDebt.toLocaleString()}</p>
               </div>
               <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-emerald-500/20 shadow-xl">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><DollarSign className="w-6 h-6" /></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Amount Paid</p>
                  </div>
                  <p className="text-3xl font-black text-emerald-400">KES {selectedClient.totalPaid.toLocaleString()}</p>
               </div>
               <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-rose-500/20 shadow-xl">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500"><AlertCircle className="w-6 h-6" /></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Current Debt Balance</p>
                  </div>
                  <p className="text-3xl font-black text-rose-400">KES {(selectedClient.totalDebt - selectedClient.totalPaid).toLocaleString()}</p>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-950/40">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                <History className="w-4 h-4 text-blue-500" /> Transactional Billing & Installment History
              </h4>
              {invoices.filter(inv => inv.clientId === selectedClient.id).map(inv => {
                const totalPaidOnInv = inv.payments.reduce((acc, p) => acc + p.amount, 0);
                const invBalance = inv.total - totalPaidOnInv;
                const isPaid = invBalance <= 0;

                return (
                  <div key={inv.id} className={`p-8 rounded-[2rem] border transition-all ${isPaid ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-slate-800/40 border-slate-700/50'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                      <div className="flex gap-4 items-center">
                        <div className={`p-4 rounded-2xl border ${isPaid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                          <Receipt className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-300">Invoice #{inv.invoiceNumber}</span>
                            {isPaid ? (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-black uppercase tracking-tighter">Settled</span>
                            ) : (
                              <span className="text-[10px] bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full font-black uppercase tracking-tighter">Pending</span>
                            )}
                          </div>
                          <p className="text-slate-100 font-bold text-lg mt-1">{inv.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-10">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Inv Total</p>
                          <p className="font-black text-xl text-white">KES {inv.total.toLocaleString()}</p>
                        </div>
                        {!isPaid && (
                          <div className="text-right">
                            <p className="text-[10px] font-black text-rose-500 uppercase mb-1 tracking-widest">Inv Due</p>
                            <p className="font-black text-2xl text-rose-400">KES {invBalance.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Payment Timeline</p>
                      {inv.payments.length > 0 ? inv.payments.map(pay => (
                        <div key={pay.id} className="flex items-center justify-between p-5 bg-slate-900/60 rounded-2xl border border-slate-800/50 group hover:border-blue-500/30 transition-all">
                          <div className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                               <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-1">
                               <div>
                                 <p className="text-[9px] font-black text-slate-500 uppercase">Payment Date</p>
                                 <p className="text-sm font-bold text-white">{pay.date}</p>
                               </div>
                               <div>
                                 <p className="text-[9px] font-black text-slate-500 uppercase">Method</p>
                                 <p className="text-sm font-bold text-blue-400">{pay.method}</p>
                               </div>
                               <div className="lg:col-span-2">
                                 <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1">
                                   <Tag className="w-2.5 h-2.5" /> Reference / Tracking
                                 </p>
                                 <p className="text-sm font-black text-slate-200 truncate italic">
                                   {pay.reference || 'No reference provided'}
                                 </p>
                               </div>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-black text-emerald-500/60 uppercase mb-0.5">Applied Amount</p>
                             <span className="text-lg font-black text-emerald-400">KES {pay.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl">
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No payments recorded for this invoice</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && selectedClient && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[3rem] w-full max-w-md p-10 border border-slate-800 shadow-3xl">
            <h3 className="text-2xl font-black mb-2 text-white uppercase tracking-tighter">Record Payment</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">Receiving installment from {selectedClient.schoolName}.</p>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Payment Amount (KES)</label>
                <input 
                  type="number" 
                  className="w-full px-6 py-4 bg-slate-800 text-white border border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-black text-xl outline-none" 
                  value={paymentAmount}
                  autoFocus
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Payment Method</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-800 text-white border border-slate-700 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/20"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="M-Pesa / Mobile Money">M-Pesa / Mobile Money</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Tag className="w-3 h-3 text-blue-400" /> Reference / Trans ID (VITAL)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. CHEQUE #1234 or M-PESA Code"
                  className="w-full px-6 py-4 bg-slate-800 text-white border border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold outline-none placeholder:text-slate-600" 
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowPaymentModal(false)} className="flex-1 px-6 py-4 border border-slate-700 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all">Cancel</button>
                <button
                  onClick={handleAddPayment}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 md:py-2 rounded-xl font-bold transition-all text-sm md:text-base shadow-xl shadow-blue-500/20"
                >
                  <span>Submit Payment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[3rem] w-full max-w-md p-10 border border-slate-800 shadow-3xl">
            <h3 className="text-2xl font-black mb-8 text-white">New School Entry</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">School Name</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl font-bold outline-none focus:border-blue-500"
                  value={newClient.schoolName}
                  onChange={(e) => setNewClient({...newClient, schoolName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Contact Person</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl font-bold outline-none focus:border-blue-500"
                  value={newClient.contactPerson}
                  onChange={(e) => setNewClient({...newClient, contactPerson: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Phone</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl font-bold outline-none focus:border-blue-500"
                  value={newClient.phoneNumber}
                  onChange={(e) => setNewClient({...newClient, phoneNumber: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-4 border border-slate-700 text-slate-500 rounded-xl font-black uppercase text-xs tracking-widest">Cancel</button>
                <button
                  onClick={handleAddClient}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 md:py-2 rounded-xl font-bold transition-all text-sm md:text-base shadow-xl shadow-blue-500/20"
                >
                  <span>Register</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManager;