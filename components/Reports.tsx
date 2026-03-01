
import React, { useState } from 'react';
import { Invoice, Client, Product } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FileText, Download, TrendingUp, Wallet, Package, School, Search, ChevronRight, ArrowUpRight, Calendar, Filter, X } from 'lucide-react';
import { generateDocumentPDF } from '../services/pdfService';

interface Props {
  invoices: Invoice[];
  clients: Client[];
  products: Product[];
}

const Reports: React.FC<Props> = ({ invoices, clients, products }) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Filter invoices based on date range for the general metrics
  const filteredInvoices = invoices.filter(inv => {
    if (startDate && inv.date < startDate) return false;
    if (endDate && inv.date > endDate) return false;
    return true;
  });

  const totalRevenue = filteredInvoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalProfit = filteredInvoices.reduce((acc, inv) => acc + inv.profit, 0);
  const totalDebt = clients.reduce((acc, client) => acc + (client.totalDebt - client.totalPaid), 0);
  const totalAssetsValue = products.reduce((acc, p) => acc + (p.buyingPrice * p.stockCount), 0);

  const categoryProfit = products.reduce((acc: any, p) => {
    const pProfit = filteredInvoices.reduce((sum, inv) => {
      const items = inv.items.filter(i => i.productId === p.id);
      return sum + items.reduce((s, item) => s + (item.totalPrice - (item.buyingPrice * item.quantity)), 0);
    }, 0);
    acc[p.category] = (acc[p.category] || 0) + pProfit;
    return acc;
  }, {});

  const pieData = Object.keys(categoryProfit).map(cat => ({
    name: cat,
    value: categoryProfit[cat]
  })).filter(d => d.value > 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const selectedClient = clients.find(c => c.id === selectedSchoolId);
  const schoolInvoices = invoices.filter(inv => inv.clientId === selectedSchoolId);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Business Intelligence</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">White Copy Strategic Insights</p>
        </div>
        
        {/* Date Range Filter UI */}
        <div className="bg-slate-800 p-4 rounded-3xl border border-slate-700 shadow-xl flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" /> Start Date
            </label>
            <input 
              type="date" 
              className="bg-slate-950 text-white border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" /> End Date
            </label>
            <input 
              type="date" 
              className="bg-slate-950 text-white border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={resetFilters}
              className="p-2.5 bg-slate-950 text-slate-500 hover:text-rose-400 border border-slate-700 rounded-xl transition-all"
              title="Clear Filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 transition-all hover:bg-slate-800">
          <TrendingUp className="w-8 h-8 text-blue-500 mb-4" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gross Profitability</p>
          <h3 className="text-2xl font-black text-white mt-1">KES {totalProfit.toLocaleString()}</h3>
          <p className="text-[10px] text-emerald-400 font-bold mt-2 uppercase tracking-tighter">
            {startDate || endDate ? 'Filtered Period' : 'All Time Margin'}: {((totalProfit / totalRevenue) * 100 || 0).toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 transition-all hover:bg-slate-800">
          <Wallet className="w-8 h-8 text-rose-500 mb-4" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Credit Exposure</p>
          <h3 className="text-2xl font-black text-white mt-1">KES {totalDebt.toLocaleString()}</h3>
          <p className="text-[10px] text-rose-400 font-bold mt-2 uppercase tracking-tighter">Total Active Debt</p>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 transition-all hover:bg-slate-800">
          <Package className="w-8 h-8 text-emerald-500 mb-4" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inventory Value</p>
          <h3 className="text-2xl font-black text-white mt-1">KES {totalAssetsValue.toLocaleString()}</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">{products.length} SKU Registered</p>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 transition-all hover:bg-slate-800">
          <School className="w-8 h-8 text-amber-500 mb-4" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue Generated</p>
          <h3 className="text-2xl font-black text-white mt-1">KES {totalRevenue.toLocaleString()}</h3>
          <p className="text-[10px] text-amber-400 font-bold mt-2 uppercase tracking-tighter">
            {startDate || endDate ? 'Period Revenue' : 'Total Portfolio Sales'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/30 p-8 rounded-[2.5rem] border border-slate-700/50">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-black text-white uppercase text-xs tracking-widest">Profit Contribution by Category</h4>
            <div className="p-2 bg-slate-950 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-800">
              Analysis View
            </div>
          </div>
          {pieData.length > 0 ? (
            <>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                      formatter={(value: number) => `KES ${value.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <div className="truncate">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">{d.name}</p>
                      <p className="text-xs font-black text-white">KES {d.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-slate-600 space-y-4">
               <Filter className="w-12 h-12 opacity-20" />
               <p className="text-xs font-bold uppercase tracking-widest italic">No sales recorded for this period</p>
            </div>
          )}
        </div>

        <div className="bg-slate-800/30 p-8 rounded-[2.5rem] border border-slate-700/50 flex flex-col">
          <h4 className="font-black text-white uppercase text-xs tracking-widest mb-6">School Account Statements</h4>
          <p className="text-slate-500 text-xs font-medium mb-8">Generate a full financial history report for an individual Kenyan High School client.</p>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Select Target Institution</label>
              <div className="relative">
                <select 
                  className="w-full px-6 py-4 bg-slate-900 text-white border border-slate-700 rounded-2xl font-bold appearance-none focus:ring-4 focus:ring-blue-500/20 outline-none"
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                >
                  <option value="">Choose a school client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.schoolName}</option>)}
                </select>
                <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 rotate-90" />
              </div>
            </div>

            {selectedClient && (
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-6 animate-in slide-in-from-right-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                      <School className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Institution</p>
                      <h5 className="text-lg font-black text-white">{selectedClient.schoolName}</h5>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Billed</p>
                    <p className="text-md font-black text-white">KES {selectedClient.totalDebt.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Paid</p>
                    <p className="text-md font-black text-emerald-400">KES {selectedClient.totalPaid.toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-5 bg-rose-500/5 rounded-2xl border border-rose-500/10 flex justify-between items-center">
                   <div>
                     <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Balance Owed</p>
                     <p className="text-2xl font-black text-rose-400">KES {(selectedClient.totalDebt - selectedClient.totalPaid).toLocaleString()}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Record Count</p>
                     <p className="text-lg font-black text-slate-300">{schoolInvoices.length} Inv</p>
                   </div>
                </div>

                <button 
                   disabled={schoolInvoices.length === 0}
                   onClick={() => {
                     if(schoolInvoices.length > 0) {
                        generateDocumentPDF(schoolInvoices[0], 'Invoice');
                     }
                   }}
                   className="w-full py-4 bg-blue-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                >
                  <Download className="w-4 h-4" /> Export Account Statement
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
