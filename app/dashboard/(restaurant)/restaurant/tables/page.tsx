'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { restaurantService } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthContext';
import { 
  Plus, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  Printer,
  ChevronDown,
  Loader2, 
  Info,
  ExternalLink,
  QrCode,
  FolderClosed,
  Edit,
  Users,
  X,
  Palette
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getQrUrl } from '@/utils/qrUrl';
import CustomizableQRCode from '@/components/CustomizableQRCode';
import QRDesignModal from '@/components/QRDesignModal';
import { useSuiteBack } from '@/components/suites/SuiteBack';

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
  logoUrl?: string | null;
  customDesign?: any | null;
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
  const [selectedDesignQr, setSelectedDesignQr] = useState<any | null>(null);
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
  const [actionsOpen, setActionsOpen] = useState(false);
  const [printingId, setPrintingId] = useState<number | "all" | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const leavePrint = useCallback(() => setPrintMode(false), []);
  useSuiteBack(printMode ? leavePrint : null);

  const fetchData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const tablesRes = await restaurantService.listTables();
      const menusRes = await restaurantService.listMenus();

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

  useEffect(() => {
    const finishPrint = () => {
      delete document.body.dataset.printScope;
      setPrintingId(null);
    };
    window.addEventListener("afterprint", finishPrint);
    return () => window.removeEventListener("afterprint", finishPrint);
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;

    setAddingTable(true);
    try {
      const res = await restaurantService.createTable({
        tableNumber: newTableNumber.trim(),
        capacity: newCapacity ? Number(newCapacity) : 4,
        menuId: selectedMenuId ? Number(selectedMenuId) : null,
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
      const res = await restaurantService.updateTable({
        id: editingTable.id,
        tableNumber: editTableNumber.trim(),
        capacity: editCapacity ? Number(editCapacity) : null,
        menuId: editMenuId ? Number(editMenuId) : null,
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
      const res = await restaurantService.updateTable({
        id: tableId,
        menuId: menuId ? Number(menuId) : null,
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
      const res = await restaurantService.deleteTable(id);
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

  const saveFile = (href: string, filename: string) => {
    const downloadLink = document.createElement('a');
    downloadLink.href = href;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const downloadQR = (qr: QRCodeData, tableName: string, silent = false) => {
    return new Promise<boolean>((resolve) => {
      const svg = document.getElementById(`table-qr-${qr.shortCode}`);
      const safeName = tableName.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'table';
      if (!svg) {
        if (!silent) toast.error('Could not find this QR code.');
        resolve(false);
        return;
      }

      const design = (qr.customDesign as any) || {};
      const hasFrame = design.frameId && design.frameId !== 'no_frame';

      try {
        const svgXml = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = hasFrame ? 1050 : 1000;
            canvas.height = hasFrame ? 1260 : 1000;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas unavailable');
            ctx.fillStyle = qr.bgColor || '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            saveFile(canvas.toDataURL('image/png'), `qr-${safeName}.png`);
            if (!silent) toast.success('QR code downloaded.');
            URL.revokeObjectURL(svgUrl);
            resolve(true);
          } catch (err) {
            console.error(err);
            saveFile(svgUrl, `qr-${safeName}.svg`);
            if (!silent) toast.success('QR code downloaded.');
            resolve(true);
          }
        };
        img.onerror = () => {
          saveFile(svgUrl, `qr-${safeName}.svg`);
          if (!silent) toast.success('QR code downloaded.');
          resolve(true);
        };
        img.src = svgUrl;
      } catch (err) {
        console.error(err);
        if (!silent) toast.error('Failed to download QR code');
        resolve(false);
      }
    });
  };

  const printCards = (tableId?: number) => {
    if (tableId) {
      document.body.dataset.printScope = 'one';
      setPrintingId(tableId);
    } else {
      delete document.body.dataset.printScope;
      setPrintingId('all');
    }
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.print());
    });
  };

  const downloadAllCards = async () => {
    const cards = tables.filter((table) => table.qrCode);
    if (cards.length === 0) {
      toast.error('Add a table before downloading.');
      return;
    }
    setDownloadingAll(true);
    try {
      let saved = 0;
      for (const table of cards) {
        const ok = await downloadQR(table.qrCode!, table.tableNumber, true);
        if (ok) saved += 1;
        await new Promise((resolve) => window.setTimeout(resolve, 300));
      }
      if (saved === 0) toast.error('Could not download the table cards.');
      else toast.success(saved === 1 ? 'QR code downloaded.' : `${saved} QR codes downloaded.`);
    } finally {
      setDownloadingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (printMode) {
    const cards = tables.filter((table) => table.qrCode);
    return (
      <div className="table-print-sheet -mx-4 bg-[#F6F1EA] md:-mx-8">
        <div className="no-print sticky -top-4 z-20 border-b border-[#E7DDD2] bg-[#F6F1EA] px-4 pt-6 pb-2.5 md:-top-8 md:px-8 md:pt-11 md:pb-3">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <button
            type="button"
            onClick={() => setActionsOpen((open) => !open)}
            aria-expanded={actionsOpen}
            className="flex w-full items-center justify-between gap-3 rounded-xl bg-transparent py-1 text-left cursor-pointer border-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C4622D] md:w-auto md:pointer-events-none"
          >
            <span className="min-w-0">
              <span className="block text-base font-semibold leading-tight text-[#2A211C]">Table cards</span>
              <span className="block text-xs text-[#6B5A50]">
                {cards.length === 0 ? 'No cards yet' : `${cards.length} ${cards.length === 1 ? 'card' : 'cards'} ready`}
              </span>
            </span>
            <ChevronDown className={`h-5 w-5 shrink-0 text-[#8A7568] transition-transform md:hidden ${actionsOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`w-full gap-2 md:flex md:w-auto ${actionsOpen ? 'flex' : 'hidden'}`}>
            <button
              type="button"
              onClick={() => printCards()}
              disabled={cards.length === 0}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#C4622D] px-3 text-sm font-semibold text-white cursor-pointer border-none hover:bg-[#A85224] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C4622D] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-4"
            >
              <Printer className="h-4 w-4" />
              Print all
            </button>
            <button
              type="button"
              onClick={() => void downloadAllCards()}
              disabled={cards.length === 0 || downloadingAll}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#E7DDD2] bg-white px-3 text-sm font-semibold text-[#2A211C] cursor-pointer hover:bg-[#FBF8F4] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#C4622D] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-4"
            >
              {downloadingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download all
            </button>
          </div>
          </div>
        </div>

        <div className="px-4 pb-4 pt-4 md:px-8 md:pb-8 md:pt-5">
          {cards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E7DDD2] bg-white px-6 py-16 text-center">
              <QrCode className="mx-auto h-8 w-8 text-[#C4622D]" />
              <p className="mt-3 font-semibold text-[#2A211C]">No table cards yet</p>
              <button
                type="button"
                onClick={() => setPrintMode(false)}
                className="mt-4 rounded-xl bg-[#C4622D] px-4 py-2.5 text-sm font-semibold text-white cursor-pointer border-none"
              >
                Back to tables
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-2 print:gap-6">
              {cards.map((table) => (
                <article
                  key={table.id}
                  className={`table-print-card flex flex-col items-center rounded-2xl border border-[#E7DDD2] bg-white px-4 py-4 text-center shadow-sm print:px-5 print:py-6 print:shadow-none ${printingId === table.id ? 'is-printing' : ''}`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C4622D]">Scan menu</p>
                  <div className="my-2 w-[168px] max-w-full [&_svg]:h-auto [&_svg]:max-w-full [&_svg]:w-full print:my-4 print:w-[200px]">
                    <CustomizableQRCode
                      id={`table-qr-${table.qrCode!.shortCode}`}
                      value={getQrUrl(table.qrCode!.shortCode)}
                      fgColor={table.qrCode!.fgColor || '#000000'}
                      bgColor={table.qrCode!.bgColor || '#FFFFFF'}
                      logoUrl={table.qrCode!.logoUrl}
                      logoPreset={table.qrCode!.customDesign?.logoPreset || 'none'}
                      frameId={table.qrCode!.customDesign?.frameId || 'no_frame'}
                      frameText={table.qrCode!.customDesign?.frameText || ''}
                      frameColor={table.qrCode!.customDesign?.frameColor || '#001b50'}
                      frameTextColor={table.qrCode!.customDesign?.frameTextColor || '#ffffff'}
                      size={168}
                    />
                  </div>
                  <p className="max-w-full break-words text-lg font-semibold leading-tight text-[#2A211C]">{table.tableNumber}</p>
                  {table.menu ? <p className="mt-1 text-xs text-[#6B5A50]">{table.menu.name}</p> : null}
                  <div className="no-print mt-3 grid w-full grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => void downloadQR(table.qrCode!, table.tableNumber)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E7DDD2] bg-white px-3 py-2.5 text-sm font-semibold text-[#2A211C] cursor-pointer hover:bg-[#FBF8F4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C4622D] active:scale-[0.98]"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => printCards(table.id)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C4622D] px-3 py-2.5 text-sm font-semibold text-white cursor-pointer border-none hover:bg-[#A85224] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C4622D] active:scale-[0.98]"
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
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
            onClick={() => {
              setActionsOpen(false);
              setPrintMode(true);
            }}
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
                      <CustomizableQRCode
                        id={`table-qr-${table.qrCode.shortCode}`}
                        value={getQrUrl(table.qrCode.shortCode)}
                        fgColor={table.qrCode.fgColor || '#000000'}
                        bgColor={table.qrCode.bgColor || '#FFFFFF'}
                        logoUrl={table.qrCode.logoUrl}
                        logoPreset={table.qrCode.customDesign?.logoPreset || 'none'}
                        frameId={table.qrCode.customDesign?.frameId || 'no_frame'}
                        frameText={table.qrCode.customDesign?.frameText || ''}
                        frameColor={table.qrCode.customDesign?.frameColor || '#001b50'}
                        frameTextColor={table.qrCode.customDesign?.frameTextColor || '#ffffff'}
                        size={500}
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
                      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-center max-w-[150px] max-h-[180px] mx-auto my-4 shadow-inner overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">
                          <CustomizableQRCode
                            value={getQrUrl(table.qrCode.shortCode)}
                            fgColor={table.qrCode.fgColor || '#000000'}
                            bgColor={table.qrCode.bgColor || '#FFFFFF'}
                            logoUrl={table.qrCode.logoUrl}
                            logoPreset={table.qrCode.customDesign?.logoPreset || 'none'}
                            frameId={table.qrCode.customDesign?.frameId || 'no_frame'}
                            frameText={table.qrCode.customDesign?.frameText || ''}
                            frameColor={table.qrCode.customDesign?.frameColor || '#001b50'}
                            frameTextColor={table.qrCode.customDesign?.frameTextColor || '#ffffff'}
                            size={110}
                          />
                        </div>
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

                    {/* Download & Customize Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setSelectedDesignQr(table.qrCode)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-slate-200"
                      >
                        <Palette className="w-3.5 h-3.5 text-slate-500" />
                        Customize
                      </button>
                      <button
                        onClick={() => downloadQR(table.qrCode!, `${table.tableNumber}`)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-primary hover:bg-[#001b50] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer border-none shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
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
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-655 cursor-pointer disabled:opacity-50"
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

      {/* Custom Design Modal */}
      {selectedDesignQr && (
        <QRDesignModal
          isOpen={!!selectedDesignQr}
          onClose={() => setSelectedDesignQr(null)}
          qrCode={selectedDesignQr}
          onSave={(updatedQr) => {
            setTables((prev) =>
              prev.map((t) => {
                if (t.qrCode && t.qrCode.id === updatedQr.id) {
                  return {
                    ...t,
                    qrCode: {
                      ...t.qrCode,
                      ...updatedQr,
                    },
                  };
                }
                return t;
              })
            );
          }}
        />
      )}
    </div>
  );
}
