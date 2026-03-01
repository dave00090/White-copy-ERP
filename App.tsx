
import React, { useState, useEffect } from 'react';
import { Product, Client, Invoice, Payment } from './types';
import { Database } from './utils/storage';
import Dashboard from './components/Dashboard';
import ClientManager from './components/ClientManager';
import InventoryManager from './components/InventoryManager';
import InvoiceManager from './components/InvoiceManager';
import Reports from './components/Reports';
import LoginPage from './components/LoginPage';
import { LayoutDashboard, Users, Package, FileText, Menu, X, ChevronRight, BarChart2, Power } from 'lucide-react';

const SidebarItem = ({ id, icon: Icon, label, activeTab, isSidebarOpen, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      activeTab === id 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    } ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
    title={!isSidebarOpen ? label : ''}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    {isSidebarOpen && <span className="font-semibold truncate">{label}</span>}
    {isSidebarOpen && activeTab === id && <ChevronRight className="ml-auto w-4 h-4 flex-shrink-0" />}
  </button>
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'inventory' | 'invoices' | 'reports'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    // Check session
    const auth = localStorage.getItem('wc_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }

    setProducts(Database.getProducts());
    setClients(Database.getClients());
    setInvoices(Database.getInvoices());
  }, []);

  const handleLogin = (status: boolean) => {
    if (status) {
      setIsAuthenticated(true);
      localStorage.setItem('wc_auth', 'true');
    }
  };

  const handleEndSession = () => {
    const isConfirmed = window.confirm("Terminate current session and exit White Copy ERP?");
    if (isConfirmed) {
      // 1. Clear session marker
      localStorage.removeItem('wc_auth');
      
      // 2. Clear local state
      setIsAuthenticated(false);
      
      // 3. Force hard reset to root to purge memory
      window.location.replace(window.location.origin + window.location.pathname);
    }
  };

  const handleAddProduct = (product: Product) => {
    const updated = [...products, product];
    setProducts(updated);
    Database.saveProducts(updated);
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    const updated = products.map(p => p.id === productId ? { ...p, stockCount: newStock } : p);
    setProducts(updated);
    Database.saveProducts(updated);
  };

  const handleAddClient = (client: Client) => {
    const updated = [...clients, client];
    setClients(updated);
    Database.saveClients(updated);
  };

  const handleCreateInvoice = (invoice: Invoice) => {
    const updatedInvoices = [...invoices, invoice];
    setInvoices(updatedInvoices);
    Database.saveInvoices(updatedInvoices);

    const updatedClients = clients.map(c => {
      if (c.id === invoice.clientId) {
        return { ...c, totalDebt: c.totalDebt + invoice.total };
      }
      return c;
    });
    setClients(updatedClients);
    Database.saveClients(updatedClients);

    const updatedProducts = products.map(p => {
      const item = invoice.items.find(i => i.productId === p.id);
      if (item) {
        return { ...p, stockCount: Math.max(0, p.stockCount - item.quantity) };
      }
      return p;
    });
    setProducts(updatedProducts);
    Database.saveProducts(updatedProducts);
  };

  const handleAddPayment = (clientId: string, payment: Payment) => {
    const updatedClients = clients.map(c => {
      if (c.id === clientId) {
        return { ...c, totalPaid: c.totalPaid + payment.amount };
      }
      return c;
    });
    setClients(updatedClients);
    Database.saveClients(updatedClients);

    let remainingPayment = payment.amount;
    const updatedInvoices = invoices.map(inv => {
      if (inv.clientId === clientId && remainingPayment > 0) {
        const currentPaid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
        const amountNeeded = inv.total - currentPaid;
        
        if (amountNeeded > 0) {
          const appliedAmount = Math.min(amountNeeded, remainingPayment);
          remainingPayment -= appliedAmount;
          
          const newPayment = { ...payment, amount: appliedAmount };
          const updatedInvPayments = [...inv.payments, newPayment];
          const newTotalPaid = currentPaid + appliedAmount;
          
          return {
            ...inv,
            payments: updatedInvPayments,
            status: newTotalPaid >= inv.total ? 'Paid' : 'Partial'
          } as Invoice;
        }
      }
      return inv;
    });

    setInvoices(updatedInvoices);
    Database.saveInvoices(updatedInvoices);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex bg-slate-900 text-white overflow-hidden">
      <aside className={`bg-slate-950 border-r border-slate-800 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tighter leading-none">WHITE COPY</span>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Enterprises</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
            title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto overflow-x-hidden">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" activeTab={activeTab} isSidebarOpen={isSidebarOpen} onClick={setActiveTab} />
          <SidebarItem id="clients" icon={Users} label="School Clients" activeTab={activeTab} isSidebarOpen={isSidebarOpen} onClick={setActiveTab} />
          <SidebarItem id="inventory" icon={Package} label="Inventory & Spares" activeTab={activeTab} isSidebarOpen={isSidebarOpen} onClick={setActiveTab} />
          <SidebarItem id="invoices" icon={FileText} label="Invoices & Deliveries" activeTab={activeTab} isSidebarOpen={isSidebarOpen} onClick={setActiveTab} />
          <SidebarItem id="reports" icon={BarChart2} label="Business Reports" activeTab={activeTab} isSidebarOpen={isSidebarOpen} onClick={setActiveTab} />
        </nav>

        {/* System Exit Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <button 
            onClick={handleEndSession}
            className={`w-full flex items-center rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all font-black uppercase text-[10px] tracking-widest group border border-transparent hover:border-rose-500/20 shadow-sm py-4 ${
              isSidebarOpen ? 'px-4 gap-3' : 'justify-center px-0'
            }`}
            title="End Session"
          >
            <Power className="w-5 h-5 flex-shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
            {isSidebarOpen && <span>End Session</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 h-16 flex items-center justify-between px-8 sticky top-0 z-10 flex-shrink-0">
          <h1 className="text-lg font-bold text-white capitalize">{activeTab.replace('-', ' ')}</h1>
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Charles (Manager)
            </div>
            <div className="flex items-center gap-2">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Charles" className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800" alt="Avatar" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 w-full">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard products={products} clients={clients} invoices={invoices} />}
            {activeTab === 'clients' && <ClientManager clients={clients} invoices={invoices} onAddClient={handleAddClient} onAddPayment={handleAddPayment} />}
            {activeTab === 'inventory' && <InventoryManager products={products} onAddProduct={handleAddProduct} onUpdateStock={handleUpdateStock} />}
            {activeTab === 'invoices' && <InvoiceManager invoices={invoices} clients={clients} products={products} onCreateInvoice={handleCreateInvoice} />}
            {activeTab === 'reports' && <Reports invoices={invoices} clients={clients} products={products} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
