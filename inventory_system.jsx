import React, { useState, useRef } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  PlusCircle, 
  AlertTriangle, 
  Search,
  CheckCircle2,
  Eraser,
  Printer,
  Zap,
  Box,
  Trash2,
  Settings,
  Plus
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Inventario de Consumibles Internos
  const [inventory, setInventory] = useState([
    { id: 'FUS-10A', name: 'Fusible cerámico 10A', stock: 50, min: 10, unit: 'pza', category: 'Protecciones' },
    { id: 'TER-6MM', name: 'Terminal de ojo 6mm', stock: 100, min: 20, unit: 'pza', category: 'Conectorización' },
    { id: 'CIN-AIS', name: 'Cinta aislante negra 3M', stock: 12, min: 5, unit: 'rollos', category: 'Aislamiento' },
    { id: 'LIM-DPT', name: 'Limpiador de contactos (Dielectrico)', stock: 6, min: 2, unit: 'latas', category: 'Químicos' },
    { id: 'CIN-PLAS', name: 'Cintillos plásticos 20cm', stock: 300, min: 50, unit: 'pza', category: 'Sujeción' },
  ]);

  const [history, setHistory] = useState([
    { id: 1, date: '22/12/2025', tech: 'Admin Interno', item: 'Cinta aislante negra 3M', qty: 2, project: 'Mantenimiento preventivo Tablero A', signature: null },
  ]);

  const [newExit, setNewExit] = useState({ tech: '', itemId: '', qty: '', project: '' });
  const [newItem, setNewItem] = useState({ id: '', name: '', stock: '', min: '', unit: 'pza', category: 'General' });

  // Gestión de Inventario (Altas y Bajas)
  const addNewItem = (e) => {
    e.preventDefault();
    if (inventory.find(i => i.id === newItem.id)) {
      alert("Este código SKU ya existe.");
      return;
    }
    setInventory([...inventory, { ...newItem, stock: Number(newItem.stock), min: Number(newItem.min) }]);
    setNewItem({ id: '', name: '', stock: '', min: '', unit: 'pza', category: 'General' });
    alert("Insumo agregado exitosamente.");
  };

  const deleteItem = (id) => {
    if (window.confirm("¿Está seguro de eliminar este insumo del inventario?")) {
      setInventory(inventory.filter(i => i.id !== id));
    }
  };

  // Lógica de Firma
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleExitSubmit = (e) => {
    e.preventDefault();
    const item = inventory.find(i => i.id === newExit.itemId);
    
    if (!item || item.stock < newExit.qty) {
      alert("No hay suficientes consumibles en el estante.");
      return;
    }

    const signatureData = canvasRef.current.toDataURL();

    setInventory(inventory.map(i => 
      i.id === newExit.itemId ? { ...i, stock: i.stock - Number(newExit.qty) } : i
    ));

    setHistory([{
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      tech: newExit.tech,
      item: item.name,
      qty: Number(newExit.qty),
      project: newExit.project,
      signature: signatureData
    }, ...history]);
    
    setNewExit({ tech: '', itemId: '', qty: '', project: '' });
    clearSignature();
    setActiveTab('history');
  };

  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Control Interno de Consumibles - Energía</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 13px; }
            th { background-color: #f1f5f9; text-transform: uppercase; }
            .low { color: #e11d48; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Inventario Interno de Consumibles</h2>
            <p>Coordinación de Operaciones y Mantenimiento de Energía</p>
          </div>
          <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Insumo</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Unidad</th>
              </tr>
            </thead>
            <tbody>
              ${inventory.map(item => `
                <tr>
                  <td>${item.id}</td>
                  <td>${item.name}</td>
                  <td>${item.category}</td>
                  <td class="${item.stock <= item.min ? 'low' : ''}">${item.stock}</td>
                  <td>${item.unit}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const lowStockItems = inventory.filter(i => i.stock <= i.min);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <nav className="w-64 bg-slate-900 text-white p-5 hidden md:block">
        <div className="flex items-center gap-2 mb-8 px-2">
          <Box className="text-blue-400" size={28} />
          <div>
            <h1 className="font-bold text-sm leading-tight text-white uppercase tracking-tight">Consumibles</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Energía Interno</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <MenuBtn active={activeTab === 'dashboard'} icon={<LayoutDashboard size={18}/>} label="Estado General" onClick={() => setActiveTab('dashboard')} />
          <MenuBtn active={activeTab === 'inventory'} icon={<Package size={18}/>} label="Stock de Insumos" onClick={() => setActiveTab('inventory')} />
          <MenuBtn active={activeTab === 'admin'} icon={<Settings size={18}/>} label="Administrar Ítems" onClick={() => setActiveTab('admin')} />
          <MenuBtn active={activeTab === 'new-exit'} icon={<PlusCircle size={18}/>} label="Registrar Gasto" onClick={() => setActiveTab('new-exit')} />
          <MenuBtn active={activeTab === 'history'} icon={<ClipboardList size={18}/>} label="Bitácora" onClick={() => setActiveTab('history')} />
        </div>

        <div className="mt-auto pt-10 border-t border-slate-800">
          <div className="flex items-center justify-between px-2 py-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Modo Editor</span>
            <button 
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`w-10 h-5 rounded-full transition-colors relative ${isAdminMode ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${isAdminMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {activeTab === 'dashboard' && <Zap size={20} className="text-blue-500"/>}
            {activeTab.replace('-', ' ').toUpperCase()}
          </h2>
          <button onClick={exportPDF} className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
            <Printer size={16} /> REPORTE DE STOCK
          </button>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DashCard label="Insumos Totales" value={inventory.length} />
              <DashCard label="Por Agotarse" value={lowStockItems.length} color="text-red-500" />
              <DashCard label="Uso hoy" value={history.filter(h => h.date === new Date().toLocaleDateString()).length} />
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input type="text" placeholder="Filtrar insumo..." className="w-full pl-10 pr-4 py-2 rounded-lg border-slate-200 text-sm outline-none" onChange={(e) => setSearchTerm(e.target.value.toLowerCase())} />
                </div>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase border-b">
                  <tr>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Nombre del Insumo</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4 text-center">Disponible</th>
                    <th className="p-4">Estado</th>
                    {isAdminMode && <th className="p-4 text-right">Acción</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {inventory.filter(i => i.name.toLowerCase().includes(searchTerm)).map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono text-xs text-slate-400">{item.id}</td>
                      <td className="p-4 font-semibold text-slate-700">{item.name}</td>
                      <td className="p-4"><span className="text-[11px] bg-slate-100 px-2 py-1 rounded-md text-slate-600">{item.category}</span></td>
                      <td className="p-4 text-center font-bold">{item.stock} <span className="text-[10px] font-normal text-slate-400 uppercase">{item.unit}</span></td>
                      <td className="p-4">
                        {item.stock <= item.min ? (
                          <span className="text-red-500 font-bold text-[10px] px-2 py-1 bg-red-50 rounded italic">REABASTECER</span>
                        ) : (
                          <span className="text-green-500 font-bold text-[10px] px-2 py-1 bg-green-50 rounded">SUFICIENTE</span>
                        )}
                      </td>
                      {isAdminMode && (
                        <td className="p-4 text-right">
                          <button onClick={() => deleteItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                  <Plus className="text-blue-500" /> AGREGAR NUEVO CONSUMIBLE
                </h3>
                <form onSubmit={addNewItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AdminInput label="Código SKU" required value={newItem.id} onChange={v => setNewItem({...newItem, id: v.toUpperCase()})} placeholder="Eje: FUS-20A" />
                  <AdminInput label="Nombre del Insumo" required value={newItem.name} onChange={v => setNewItem({...newItem, name: v})} placeholder="Eje: Fusible 20A" />
                  <AdminInput label="Categoría" required value={newItem.category} onChange={v => setNewItem({...newItem, category: v})} placeholder="Eje: Protecciones" />
                  <AdminInput label="Stock Inicial" type="number" required value={newItem.stock} onChange={v => setNewItem({...newItem, stock: v})} />
                  <AdminInput label="Mínimo Alerta" type="number" required value={newItem.min} onChange={v => setNewItem({...newItem, min: v})} />
                  <AdminInput label="Unidad" required value={newItem.unit} onChange={v => setNewItem({...newItem, unit: v})} placeholder="pza, rollos, latas..." />
                  
                  <div className="md:col-span-2 lg:col-span-3 pt-4">
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                      REGISTRAR EN EL MAESTRO DE INVENTARIO
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  <strong>Nota de Uso:</strong> Los materiales agregados aquí aparecerán automáticamente en el selector de la pestaña "Registrar Gasto". 
                  Para eliminar un ítem, asegúrese de que el <strong>Modo Editor</strong> esté activo en la barra lateral y use el icono de basura en la lista de stock.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'new-exit' && (
            <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 text-center uppercase tracking-tighter">Retiro de Material Interno</h3>
              <form onSubmit={handleExitSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Colaborador / Técnico</label>
                  <input required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={newExit.tech} onChange={e => setNewExit({...newExit, tech: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Actividad Realizada</label>
                  <input required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={newExit.project} onChange={e => setNewExit({...newExit, project: e.target.value})} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Consumible</label>
                    <select required className="w-full p-3 bg-slate-50 border rounded-xl text-sm" value={newExit.itemId} onChange={e => setNewExit({...newExit, itemId: e.target.value})}>
                      <option value="">Seleccione...</option>
                      {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({i.stock} disp.)</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Cant.</label>
                    <input type="number" required className="w-full p-3 bg-slate-50 border rounded-xl text-sm" value={newExit.qty} onChange={e => setNewExit({...newExit, qty: e.target.value})} />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Firma de Recepción</label>
                    <button type="button" onClick={clearSignature} className="text-red-500 text-[10px] font-bold">LIMPIAR</button>
                  </div>
                  <canvas ref={canvasRef} width={400} height={100} className="w-full border rounded-xl bg-slate-50 cursor-crosshair" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg">
                  <CheckCircle2 size={18} /> CONFIRMAR RETIRO
                </button>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase border-b">
                  <tr>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Responsable</th>
                    <th className="p-4">Consumible</th>
                    <th className="p-4 text-center">Cant.</th>
                    <th className="p-4">Firma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {history.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="p-4 text-slate-400">{entry.date}</td>
                      <td className="p-4"><strong>{entry.tech}</strong><br/><span className="text-[10px] text-slate-400">{entry.project}</span></td>
                      <td className="p-4 text-blue-600 font-medium">{entry.item}</td>
                      <td className="p-4 text-center font-bold">{entry.qty}</td>
                      <td className="p-4">
                        {entry.signature && <img src={entry.signature} alt="Firma" className="h-8 border bg-white p-0.5" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Componentes UI
const MenuBtn = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
    {icon} {label}
  </button>
);

const DashCard = ({ label, value, color = "text-slate-800" }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
  </div>
);

const AdminInput = ({ label, type = "text", value, onChange, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
      {...props}
    />
  </div>
);

export default App;