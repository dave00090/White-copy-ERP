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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'inventory' | 'invoices' | 'reports'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const auth = localStorage.getItem('wc_auth');
      if (auth === 'true') {
        setIsAuthenticated(true);

        const cloudProducts = await Database.getProducts();
        const cloudClients = await Database.getClients();
        const cloudInvoices = await Database.getInvoices();

        setProducts(cloudProducts);
        setClients(cloudClients);
        setInvoices(cloudInvoices);
      }
      setIsLoading(false);
    };
    loadData();
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
      localStorage.removeItem('wc_auth');
      setIsAuthenticated(false);
      window.location.replace(window.location.origin + window.location.pathname);
    }
  };

  const handleAddProduct = async (product: Product) => {
    const updated = [...products, product];
    setProducts(updated);
    await Database.saveProducts(updated);
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    const updated = products.map(p =>
      p.id === productId ? { ...p, stockCount: newStock } : p
    );
    setProducts(updated);
    await Database.saveProducts(updated);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Remove this item from inventory?")) {
      const updated = products.filter(p => p.id !== productId);
      setProducts(updated);
      await Database.saveProducts(updated);
    }
  };

  const handleAddClient = async (client: Client) => {
    const updated = [...clients, client];
    setClients(updated);
    await Database.saveClients(updated);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm("Are you sure you want to delete this school? This action cannot be undone.")) {
      const updated = clients.filter(c => c.id !== clientId);
      setClients(updated);
      await Database.saveClients(updated);
    }
  };

  const handleCreateInvoice = async (invoice: Invoice) => {
    // 1. Save invoice
    const updatedInvoices = [...invoices, invoice];
    setInvoices(updatedInvoices);
    await Database.saveInvoices(updatedInvoices);

    // 2. Update client debt
    const updatedClients = clients.map(c =>
      c.id === invoice.clientId
        ? { ...c, totalDebt: c.totalDebt + invoice.total }
        : c
    );
    setClients(updatedClients);
    await Database.saveClients(updatedClients);

    // 3. Update stock levels, EXCLUDING Services
    const updatedProducts = products.map(product => {
      const soldItem = invoice.items.find(item => item.productId === product.id);

      if (soldItem && product.category !== 'Service') {
        return {
          ...product,
          stockCount: Math.max(0, product.stockCount - soldItem.quantity)
        };
      }
      return product;
    });
    setProducts(updatedProducts);
    await Database.saveProducts(updatedProducts);
  };

  const handleAddPayment = async (clientId: string, payment: Payment) => {
    const updatedClients = clients.map(c =>
      c.id === clientId
        ? { ...c, totalPaid: c.totalPaid + payment.amount }
        : c
    );
    setClients(updatedClients);
    await Database.saveClients(updatedClients);

    let remainingPayment = payment.amount;

    const updatedInvoices = invoices.map(inv => {
      if (inv.clientId === clientId && remainingPayment > 0) {
        const currentPaid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
        const amountNeeded = inv.total - currentPaid;

        if (amountNeeded > 0) {
          const appliedAmount = Math.min(amountNeeded, remainingPayment);
          remainingPayment -= appliedAmount;

          return {
            ...inv,
            payments: [...inv.payments, { ...payment, amount: appliedAmount }],
            status: currentPaid + appliedAmount >= inv.total ? 'Paid' : 'Partial',
          } as Invoice;
        }
      }
      return inv;
    });

    setInvoices(updatedInvoices);
    await Database.saveInvoices(updatedInvoices);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">
          Initializing White Copy ERP…
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex bg-slate-900 text-white overflow-hidden relative">
      
      <aside className={`
        bg-slate-950 border-r border-slate-800 transition-all duration-300 flex flex-col z-50
        fixed inset-y-0 left-0 lg:relative
        ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'}
      `}>
        
        <div className="p-6 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter leading-none">WHITE COPY</span>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Enterprises</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            <X className="w-5 h-5 lg:hidden" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto overflow-x-hidden">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" activeTab={activeTab} isSidebarOpen={isSidebarOpen} onClick={setActiveTab} />
          <SidebarItem id="clients" icon={Users} label="School Clients" activeTab={activeTab} isSidebarOpen={isSidebarOpen} onClick={setActiveTab} />
          <SidebarItem id="inventory" icon={Package} label="Inventory & Spares" activeTab={activeTab} isSidebarOpen={isSidebarOpen} onClick={setActiveTab} />
          <SidebarItem id="invoices" icon={FileText} label="Invoices & Deliveries" activeTab={activeTab} isSidebarOpen={isSidebarOpen} onClick={setActiveTab} />
          <SidebarItem id="reports" icon={BarChart2} label="Business Reports" activeTab={activeTab} isSidebarOpen={isSidebarOpen} onClick={setActiveTab} />
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={handleEndSession}
            className="w-full flex items-center rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all font-black uppercase text-[10px] tracking-widest py-4 px-4 gap-3"
          >
            <Power className="w-5 h-5" />
            <span>End Session</span>
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 flex-shrink-0">
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 mr-2 hover:bg-slate-800 rounded-lg text-slate-400 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-base md:text-lg font-bold text-white capitalize truncate">
            {activeTab.replace('-', ' ')}
          </h1>

        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard products={products} clients={clients} invoices={invoices} />}
            {activeTab === 'clients' && (
              <ClientManager
                clients={clients}
                invoices={invoices}
                onAddClient={handleAddClient}
                onAddPayment={handleAddPayment}
                onDeleteClient={handleDeleteClient}
              />
            )}
            {activeTab === 'inventory' && (
              <InventoryManager
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateStock={handleUpdateStock}
                onDeleteProduct={handleDeleteProduct}
              />
            )}
            {activeTab === 'invoices' && <InvoiceManager invoices={invoices} clients={clients} products={products} onCreateInvoice={handleCreateInvoice} />}
            {activeTab === 'reports' && <Reports invoices={invoices} clients={clients} products={products} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;