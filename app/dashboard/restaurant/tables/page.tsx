'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  Loader2, 
  Info,
  ExternalLink,
  QrCode,
  FolderClosed,
  Edit,
  Users,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getQrUrl } from '@/utils/qrUrl';

interface Menu {
  id: number;
  name: string;
  isDefault: boolean;
}

interface QRCodeData {
  id: number;
  shortCode: string;
  name: string;
  fgColor: string;
  bgColor: string;
  totalScans: number;
  uniqueScans: number;
}

interface TableData {
  id: number;
  tableNumber: string;
  capacity: number | null;
  qrCodeId: number | null;
  qrCode: QRCodeData | null;
  menuId: number | null;
  menu: Menu | null;
}

export default function TablesManagementPage() {
  const { user } = useAuth();
  const [tables, setTables] = useState<TableData[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create table form state
  const [addingTable, setAddingTable] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState<string>('4');
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');

  // Edit table modal state
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [editTableNumber, setEditTableNumber] = useState('');
  const [editCapacity, setEditCapacity] = useState<string>('4');
  const [editMenuId, setEditMenuId] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [printMode, setPrintMode] = useState(false);

  const fetchData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      
      // Fetch tables
      const tablesRes = await fetch('/api/restaurant/tables', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch menus
      const menusRes = await fetch('/api/restaurant/menus', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (tablesRes.ok && menusRes.ok) {
        const tablesJson = await tablesRes.json();
        const menusJson = await menusRes.json();
        setTables(tablesJson.tables || []);
        setMenus(menusJson.menus || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tables data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;

    setAddingTable(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/restaurant/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          tableNumber: newTableNumber.trim(),
          capacity: newCapacity ? Number(newCapacity) : 4,
          menuId: selectedMenuId ? Number(selectedMenuId) : null
        })
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`Table "${newTableNumber}" created successfully!`);
        setNewTableNumber('');
        setNewCapacity('4');
        setSelectedMenuId('');
        await fetchData();
      } else {
        toast.error(json.error || 'Failed to create table');
      }
    } catch (err) {
      toast.error('Failed to create table');
    } finally {
      setAddingTable(false);
    }
  };

  const openEditModal = (table: TableData) => {
    setEditingTable(table);
    setEditTableNumber(table.tableNumber);
    setEditCapacity(String(table.capacity ?? 4));
    setEditMenuId(table.menuId ? String(table.menuId) : '');
  };

  const handleSaveEdit = async () => {
    if (!editingTable || !editTableNumber.trim()) return;
    setSavingEdit(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/restaurant/tables', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingTable.id,
          tableNumber: editTableNumber.trim(),
          capacity: editCapacity ? Number(editCapacity) : null,
          menuId: editMenuId ? Number(editMenuId) : null,
        })
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Table updated successfully!');
        setEditingTable(null);
        await fetchData();
      } else {
        toast.error(json.error || 'Failed to update table');
      }
    } catch (err) {
      toast.error('Failed to update table');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleLinkMenu = async (tableId: number, menuId: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/restaurant/tables', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          id: tableId, 
          menuId: menuId ? Number(menuId) : null 
        })
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Table menu updated successfully!');
        await fetchData();
      } else {
        toast.error(json.error || 'Failed to update table menu');
      }
    } catch (err) {
      toast.error('Failed to update table menu');
    }
  };

  const handleDeleteTable = async (id: number) => {
    if (!confirm('Are you sure you want to delete this table? The linked QR code and scan tracking will be permanently deleted.')) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/restaurant/tables?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Table deleted successfully');
        await fetchData();
      } else {
        toast.error('Failed to delete table');
      }
    } catch (err) {
      toast.error('Failed to delete table');
    }
  };

  const handleCopy = (id: number, shortCode: string) => {
    const fullUrl = getQrUrl(shortCode);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success('Table scan URL copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadQR = (shortCode: string, tableName: string) => {
    const svg = document.getElementById(`table-qr-${shortCode}`);
    if (!svg) return;
    const svgXml = new XMLSerializer().serializeToString(svg);
    const svgBase64 = btoa(unescape(encodeURIComponent(svgXml)));
    
    const img = new Image();
    img.src = `data:image/svg+xml;base64,${svgBase64}`;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 1000, 1000);
        ctx.drawImage(img, 0, 0, 1000, 1000);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `qr-${tableName.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (printMode) {
    return (
      <div className="bg-white min-h-screen p-8 print:p-0 animate-fade-in">
        <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center print:hidden">
          <div className="text-sm text-slate-655">
            <span className="font-bold text-[#001B50]">Print Preview Mode:</span> Cut-out cards for your restaurant tables.
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-[#001b50] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer border-none"
            >
              <Printer className="w-4 h-4" />
              Print Now
            </button>
            <button
              onClick={() => setPrintMode(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Close Print Mode
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 p-4 bg-white print:gap-12">
          {tables.map((table) => {
            if (!table.qrCode) return null;
            return (
              <div 
                key={table.id} 
                className="border-2 border-slate-200 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 page-break-inside-avoid shadow-sm max-w-[320px] mx-auto bg-white"
              >
                <div className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-wider">
                  SCAN MENU
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <QRCodeSVG
                    value={getQrUrl(table.qrCode.shortCode)}
                    size={180}
                    fgColor="#000000"
                    bgColor="#FFFFFF"
                    level="H"
                  />
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-slate-700 text-sm">Table Number</div>
                  <div className="font-black text-slate-900 text-2xl">{table.tableNumber}</div>
                  {table.capacity && (
                    <div className="text-xs text-slate-400">Capacity: {table.capacity} persons</div>
                  )}
                  {table.menu && (
                    <div className="text-xs text-primary font-bold">({table.menu.name})</div>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">Powered by QR Junction</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#001B50] mb-2">Tables & QR Codes</h1>
          <p className="text-slate-600 font-sans">Add restaurant tables, link them to specific menus, and generate unique QR codes.</p>
        </div>
        {tables.length > 0 && (
          <button
            onClick={() => setPrintMode(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm border border-slate-200 cursor-pointer"
          >
            <Printer className="w-4.5 h-4.5" />
            Print All Table Stands
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Add Table Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-[#001B50] mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Add Restaurant Table
            </h3>

            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Table Label</label>
                <input
                  type="text"
                  placeholder="e.g. Table 1, Cabin A, T5"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-sans focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Seating Capacity</label>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="number"
                    placeholder="e.g. 4"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    min="1"
                    max="999"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-sans focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Link to Menu</label>
                <select
                  value={selectedMenuId}
                  onChange={(e) => setSelectedMenuId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm text-slate-800 outline-none cursor-pointer"
                >
                  <option value="">Default Menu (Fallback)</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={addingTable || !newTableNumber.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-[#001b50] text-white font-semibold rounded-xl text-sm transition-all shadow-md disabled:opacity-60 cursor-pointer border-none"
              >
                {addingTable ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Table & QR Code
              </button>
            </form>
          </div>

          <div className="bg-slate-50 border border-slate-250 rounded-2xl p-6 text-slate-655 text-xs flex gap-3">
            <Info className="w-5 h-5 shrink-0 text-primary" />
            <div>
              <span className="font-bold text-[#001B50]">How tables QR work:</span>
              <p className="mt-1 leading-relaxed">
                When a customer scans a table QR code, they are redirected to your digital menu page. The URL carries the table number parameter which is tracked inside scans, giving you physical scan-location metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Table Inventory Grid */}
        <div className="lg:col-span-2">
          {tables.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
              <QrCode className="w-12 h-12 text-slate-350 mx-auto mb-4 animate-pulse" />
              <h4 className="font-bold text-[#001B50] mb-1 text-base">No Tables Configured</h4>
              <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6">Create tables using the form on the left to generate QRs and track table metrics.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tables.map((table) => {
                if (!table.qrCode) return null;
                return (
                  <div 
                    key={table.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all relative group"
                  >
                    {/* Hidden SVG element for download */}
                    <div className="hidden">
                      <QRCodeSVG
                        id={`table-qr-${table.qrCode.shortCode}`}
                        value={getQrUrl(table.qrCode.shortCode)}
                        size={500}
                        fgColor="#000000"
                        bgColor="#FFFFFF"
                        level="H"
                      />
                    </div>

                    <div>
                      {/* Top bar */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-sans">Table Label</span>
                          <h4 className="text-xl font-bold text-slate-900 mt-0.5">{table.tableNumber}</h4>
                          {table.capacity && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                              <Users className="w-3 h-3" />
                              <span>{table.capacity} persons</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(table)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                            title="Edit Table"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTable(table.id)}
                            className="p-1.5 text-slate-400 hover:text-red-655 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Delete Table"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Display QR code */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-center max-w-[150px] mx-auto my-4 shadow-inner">
                        <QRCodeSVG
                          value={getQrUrl(table.qrCode.shortCode)}
                          size={110}
                          fgColor="#000000"
                          bgColor="#FFFFFF"
                          level="H"
                        />
                      </div>

                      {/* Menu Link dropdown selector */}
                      <div className="mb-4">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">Linked Menu</label>
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 relative">
                          <FolderClosed className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <select
                            value={table.menuId || ''}
                            onChange={(e) => handleLinkMenu(table.id, e.target.value)}
                            className="bg-transparent text-xs font-bold text-[#001B50] outline-none cursor-pointer w-full"
                          >
                            <option value="">Default Menu (Fallback)</option>
                            {menus.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Link stats */}
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs mb-4">
                        <span className="font-mono text-slate-550 truncate max-w-[140px]">/q/{table.qrCode.shortCode}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopy(table.id, table.qrCode!.shortCode)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {copiedId === table.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a
                            href={getQrUrl(table.qrCode.shortCode)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-primary"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Scan Metrics */}
                    <div className="border-t border-slate-100 pt-3 mt-2 flex justify-between text-xs text-slate-500">
                      <div>
                        Total Scans: <span className="font-bold text-[#001B50]">{table.qrCode.totalScans}</span>
                      </div>
                      <div>
                        Unique Scans: <span className="font-bold text-primary">{table.qrCode.uniqueScans}</span>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={() => downloadQR(table.qrCode!.shortCode, `${table.tableNumber}`)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-slate-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download QR Code
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Table Modal */}
      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#001B50]">Edit Table</h3>
              <button
                onClick={() => setEditingTable(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Table Label</label>
                <input
                  type="text"
                  value={editTableNumber}
                  onChange={(e) => setEditTableNumber(e.target.value)}
                  placeholder="e.g. Table 1, Cabin A"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Seating Capacity</label>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="number"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(e.target.value)}
                    min="1"
                    max="999"
                    placeholder="e.g. 4"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Link to Menu</label>
                <select
                  value={editMenuId}
                  onChange={(e) => setEditMenuId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm text-slate-800 outline-none cursor-pointer"
                >
                  <option value="">Default Menu (Fallback)</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setEditingTable(null)}
                disabled={savingEdit}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-650 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit || !editTableNumber.trim()}
                className="px-5 py-2.5 bg-primary hover:bg-[#001b50] rounded-xl text-xs font-semibold text-white disabled:opacity-50 cursor-pointer flex items-center gap-1.5 border-none"
              >
                {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
