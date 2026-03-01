
import React from 'react';
import { Product, Client, Invoice } from '../types';
import { TrendingUp, Users, Package, AlertTriangle, DollarSign, Wallet, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  products: Product[];
  clients: Client[];
  invoices: Invoice[];
}

const Dashboard: React.FC<Props> = ({ products, clients, invoices }) => {
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalProfit = invoices.reduce((acc, inv) => acc + inv.profit, 0);
  const totalDebt = clients.reduce((acc, client) => acc + (client.totalDebt - client.totalPaid), 0);
  
  const lowStockProducts = products.filter(p => p.stockCount <= p.lowStockThreshold);
  const healthyStockProducts = products.filter(p => p.stockCount > p.lowStockThreshold);

  const chartData = invoices.slice(-10).map(inv => ({
    name: inv.invoiceNumber,
    profit: inv.profit,
    revenue: inv.total
  }));

  const StatsCard = ({ title, value, icon: Icon, color, subValue }: any) => (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700/50 flex items-start justify-between transform transition-hover hover:scale-[1.02]">
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</p>
        <h3 className="text-2xl font-black text-white">{value}</h3>
        {subValue && <p className="text-xs text-slate-400 mt-2 font-medium">{subValue}</p>}
      </div>
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Revenue" 
          value={`KES ${totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-indigo-600 shadow-lg shadow-indigo-500/20" 
        />
        <StatsCard 
          title="Net Profit" 
          value={`KES ${totalProfit.toLocaleString()}`} 
          icon={TrendingUp} 
          color="bg-emerald-600 shadow-lg shadow-emerald-500/20" 
          subValue="Calculated from invoices"
        />
        <StatsCard 
          title="Total Outstanding" 
          value={`KES ${totalDebt.toLocaleString()}`} 
          icon={Wallet} 
          color="bg-rose-600 shadow-lg shadow-rose-500/20" 
        />
        <StatsCard 
          title="Total Schools" 
          value={clients.length} 
          icon={Users} 
          color="bg-blue-600 shadow-lg shadow-blue-500/20" 
          subValue="Kenyan High Schools"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700/50 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-black text-white">Financial Analytics</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="w-3 h-3 bg-slate-700 rounded-full" /> Revenue
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="w-3 h-3 bg-blue-500 rounded-full" /> Profit
              </div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} fontWeight="900" tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #334155', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#334155" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Status Cards */}
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h4 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Low Stock Alerts
            </h4>
            <div className="space-y-3">
              {lowStockProducts.length > 0 ? lowStockProducts.slice(0, 4).map(product => (
                <div key={product.id} className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 flex justify-between items-center group hover:bg-rose-500/20 transition-all">
                  <div>
                    <p className="text-xs font-black text-white group-hover:text-rose-200">{product.name}</p>
                    <p className="text-[10px] text-rose-400 font-bold uppercase mt-1">Remaining: {product.stockCount}</p>
                  </div>
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                </div>
              )) : (
                <div className="text-center py-6 text-slate-500 italic text-sm">No low stock items</div>
              )}
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h4 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              In Stock Highlights
            </h4>
            <div className="space-y-3">
              {healthyStockProducts.slice(0, 4).map(product => (
                <div key={product.id} className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-black text-white">{product.name}</p>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase mt-1">Stock level: {product.stockCount}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
