import React, { useState } from 'react';
import { Product } from '../types';
import { Package, Search, Plus, AlertCircle, Edit2, Check, X, Tag } from 'lucide-react';

interface Props {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  onDeleteProduct: (productId: string) => void; // Add this
}

const InventoryManager: React.FC<Props> = ({ products, onAddProduct, onUpdateStock, onDeleteProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempStock, setTempStock] = useState<number>(0);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: 'Ink',
    buyingPrice: 0,
    sellingPrice: 0,
    stockCount: 0,
    lowStockThreshold: 10
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    if (!newProduct.name) return;
    onAddProduct({
      id: Math.random().toString(36).substr(2, 9),
      name: newProduct.name!,
      category: newProduct.category!,
      buyingPrice: Number(newProduct.buyingPrice),
      sellingPrice: Number(newProduct.sellingPrice),
      stockCount: Number(newProduct.stockCount),
      lowStockThreshold: Number(newProduct.lowStockThreshold)
    });
    setShowAddModal(false);
    setNewProduct({ name: '', category: 'Ink', buyingPrice: 0, sellingPrice: 0, stockCount: 0, lowStockThreshold: 10 });
  };

  const startEditing = (p: Product) => {
    setEditingId(p.id);
    setTempStock(p.stockCount);
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdateStock(editingId, tempStock);
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:items-center md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventory & Spares</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Supply Management Portal</p>
        </div>
        <div className="flex gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search product or category..." 
              className="pl-10 pr-4 py-2.5 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-80 shadow-2xl transition-all font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* ✅ Larger Touch Target applied */}
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 md:py-2 rounded-xl font-bold transition-all text-sm md:text-base shadow-xl shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total SKU</p>
          <p className="text-3xl font-black text-white">{products.length}</p>
        </div>
        <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 shadow-lg">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Healthy Levels</p>
          <p className="text-3xl font-black text-emerald-400">{products.filter(p => p.stockCount > p.lowStockThreshold).length}</p>
        </div>
        <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/20 shadow-lg">
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Low Stock Alerts</p>
          <p className="text-3xl font-black text-red-400">{products.filter(p => p.stockCount <= p.lowStockThreshold).length}</p>
        </div>
        <div className="bg-blue-500/5 p-6 rounded-2xl border border-blue-500/20 shadow-lg">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Estimated Value</p>
          <p className="text-3xl font-black text-blue-400">{(products.reduce((acc, p) => acc + (p.buyingPrice * p.stockCount), 0)).toLocaleString()}</p>
        </div>
      </div>

      {/* ✅ Responsive Table: scrollable container wrapping the table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto"> {/* Critical for mobile swiping */}
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700">Description</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700">Category</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700">Buying Cost</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700">Selling Price</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700">Current Stock</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700 text-right">Actions</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700">
                        <Package className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="font-bold text-white">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black px-3 py-1 bg-slate-900 text-slate-400 rounded-full border border-slate-700 uppercase tracking-widest">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-400 font-bold">{product.buyingPrice.toLocaleString()}</td>
                  <td className="px-6 py-5 text-sm font-black text-white">{product.sellingPrice.toLocaleString()}</td>
                  <td className="px-6 py-5">
                    {editingId === product.id ? (
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black text-blue-400 uppercase">Update Qty</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            autoFocus
                            className="w-24 bg-slate-900 text-white border border-blue-500 px-3 py-2 rounded-xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/20"
                            value={tempStock}
                            onChange={(e) => setTempStock(Number(e.target.value))}
                          />
                          {/* ✅ Larger Touch Target applied */}
                          <button 
                            onClick={saveEdit} 
                            className="flex items-center justify-center p-3 md:p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                            title="Confirm Save"
                          >
                            <Check className="w-5 h-5 md:w-4 md:h-4" />
                          </button>
                          {/* ✅ Larger Touch Target applied */}
                          <button 
                            onClick={cancelEdit} 
                            className="flex items-center justify-center p-3 md:p-2.5 bg-slate-900 text-slate-500 hover:text-white rounded-xl border border-slate-700 transition-all"
                            title="Cancel"
                          >
                            <X className="w-5 h-5 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-white">{product.stockCount}</span>
                        <div className="flex-1 h-1.5 w-16 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                          <div 
                            className={`h-full transition-all duration-500 ${product.stockCount <= product.lowStockThreshold ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.min(100, (product.stockCount / (product.lowStockThreshold * 3)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {product.stockCount <= product.lowStockThreshold ? (
                      <span className="flex items-center gap-1 text-rose-400 text-[10px] font-black animate-pulse bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 tracking-widest">
                        <AlertCircle className="w-3 h-3" /> LOW STOCK
                      </span>
                    ) : (
                      <span className="text-emerald-400 text-[10px] font-black bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 tracking-widest">
                        HEALTHY
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {/* ✅ Larger Touch Target applied */}
                    {editingId !== product.id && (
                      <button 
                        onClick={() => startEditing(product)} 
                        className="p-3 md:p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all border border-transparent hover:border-slate-600"
                        title="Edit Stock Levels"
                      >
                        <Edit2 className="w-5 h-5 md:w-4 md:h-4" />
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => onDeleteProduct(product.id)}
                      className="p-2.5 text-rose-400 hover:text-white hover:bg-rose-600 rounded-xl transition-all border border-transparent hover:border-rose-500"
                      title="Delete Product"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[3rem] w-full max-w-2xl p-10 border border-slate-800 shadow-3xl">
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Plus className="w-8 h-8 text-blue-500" /> New Catalog Item
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Item Description</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-slate-800 text-white border border-slate-700 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/20"
                  placeholder="e.g., Riso Ink S-4254 Black"
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Item Category</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-800 text-white border border-slate-700 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/20"
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value as any})}
                >
                  <option value="Ink">Ink</option>
                  <option value="Master">Master</option>
                  <option value="Spare Part">Spare Part</option>
                  <option value="Printer">Printer</option>
                  <option value="Service">Service</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Opening Stock Qty</label>
                <input 
                  type="number" 
                  className="w-full px-6 py-4 bg-slate-800 text-white border border-slate-700 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/20"
                  onChange={(e) => setNewProduct({...newProduct, stockCount: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Buying Cost (KES)</label>
                <input 
                  type="number" 
                  className="w-full px-6 py-4 bg-slate-800 text-white border border-slate-700 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/20"
                  onChange={(e) => setNewProduct({...newProduct, buyingPrice: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Selling Price (KES)</label>
                <input 
                  type="number" 
                  className="w-full px-6 py-4 bg-slate-800 text-white border border-slate-700 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/20"
                  onChange={(e) => setNewProduct({...newProduct, sellingPrice: Number(e.target.value)})}
                />
              </div>
            </div>
            <div className="flex gap-4 pt-10 border-t border-slate-800 mt-10">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-4 border border-slate-700 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all">Cancel</button>
              {/* ✅ Larger Touch Target applied */}
              <button
                onClick={handleAddProduct}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 md:py-2 rounded-xl font-bold transition-all text-sm md:text-base shadow-xl shadow-blue-500/20"
              >
                <span>Commit to Inventory</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;