'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { restaurantService } from '@/lib/api';
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
  ExternalLink,
  QrCode,
  Edit,
  Users,
  X,
  Palette,
  ScanLine,
  Armchair,
  Link2,
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

function StatPill({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#E7DDD2] bg-white px-4 py-3 shadow-[0_1px_0_rgba(28,20,16,0.04)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A7568]">{label}</p>
      <p className="mt-1 truncate text-2xl font-semibold tracking-tight text-[#1C1410]">{value}</p>
      {hint ? <p className="mt-0.5 truncate text-xs text-[#6B5A50]">{hint}</p> : null}
    </div>
  );
}

export default function TablesManagementPage() {
  const { user } = useAuth();
  const [tables, setTables] = useState<TableData[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedDesignQr, setSelectedDesignQr] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [addingTable, setAddingTable] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState<string>('4');
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');

  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [editTableNumber, setEditTableNumber] = useState('');
  const [editCapacity, setEditCapacity] = useState<string>('4');
  const [editMenuId, setEditMenuId] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [printMode, setPrintMode] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [printingId, setPrintingId] = useState<number | 'all' | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const leavePrint = useCallback(() => setPrintMode(false), []);
  useSuiteBack(printMode ? leavePrint : null);

  const stats = useMemo(() => {
    const withQr = tables.filter((table) => table.qrCode);
    const totalScans = withQr.reduce((sum, table) => sum + (table.qrCode?.totalScans || 0), 0);
    const uniqueScans = withQr.reduce((sum, table) => sum + (table.qrCode?.uniqueScans || 0), 0);
    const seats = tables.reduce((sum, table) => sum + (table.capacity || 0), 0);
    const top = [...withQr].sort(
      (a, b) => (b.qrCode?.totalScans || 0) - (a.qrCode?.totalScans || 0),
    )[0];
    return {
      tables: tables.length,
      totalScans,
      uniqueScans,
      seats,
      topLabel: top?.tableNumber || null,
      topScans: top?.qrCode?.totalScans || 0,
    };
  }, [tables]);

  const fetchData = async () => {
    try {
      if (!user) return;
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
    window.addEventListener('afterprint', finishPrint);
    return () => window.removeEventListener('afterprint', finishPrint);
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
        setShowAddForm(false);
        await fetchData();
      } else {
        toast.error(json.message || json.error || 'Failed to create table');
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
        toast.error(json.message || json.error || 'Failed to update table');
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
        toast.error(json.message || json.error || 'Failed to update table menu');
      }
    } catch (err) {
      toast.error('Failed to update table menu');
    }
  };

  const handleDeleteTable = async (id: number) => {
    if (
      !confirm(
        'Are you sure you want to delete this table? The linked QR code and scan tracking will be permanently deleted.',
      )
    )
      return;
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
      const safeName =
        tableName
          .toLowerCase()
          .replace(/[^a-z0-9]+/gi, '-')
          .replace(/^-|-$/g, '') || 'table';
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
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4622D]" />
      </div>
    );
  }

  if (printMode) {
    const cards = tables.filter((table) => table.qrCode);
    return (
      <div className="table-print-sheet -mx-4 bg-[#F6F1EA] md:-mx-8">
        <div className="no-print sticky -top-4 z-20 border-b border-[#E7DDD2] bg-[#F6F1EA] px-4 pb-2.5 pt-6 md:-top-8 md:px-8 md:pb-3 md:pt-11">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <button
              type="button"
              onClick={() => setActionsOpen((open) => !open)}
              aria-expanded={actionsOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border-none bg-transparent py-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C4622D] md:pointer-events-none md:w-auto"
            >
              <span className="min-w-0">
                <span className="block text-base font-semibold leading-tight text-[#2A211C]">Table cards</span>
                <span className="block text-xs text-[#6B5A50]">
                  {cards.length === 0
                    ? 'No cards yet'
                    : `${cards.length} ${cards.length === 1 ? 'card' : 'cards'} ready`}
                </span>
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-[#8A7568] transition-transform md:hidden ${actionsOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div className={`w-full gap-2 md:flex md:w-auto ${actionsOpen ? 'flex' : 'hidden'}`}>
              <button
                type="button"
                onClick={() => printCards()}
                disabled={cards.length === 0}
                className="inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border-none bg-[#C4622D] px-3 text-sm font-semibold text-white hover:bg-[#A85224] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C4622D] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-4"
              >
                <Printer className="h-4 w-4" />
                Print all
              </button>
              <button
                type="button"
                onClick={() => void downloadAllCards()}
                disabled={cards.length === 0 || downloadingAll}
                className="inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#E7DDD2] bg-white px-3 text-sm font-semibold text-[#2A211C] hover:bg-[#FBF8F4] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#C4622D] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-4"
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
                className="mt-4 cursor-pointer rounded-xl border-none bg-[#C4622D] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Back to tables
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 print:grid-cols-2 print:gap-6 xl:grid-cols-3">
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
                  <p className="max-w-full break-words text-lg font-semibold leading-tight text-[#2A211C]">
                    {table.tableNumber}
                  </p>
                  {table.menu ? <p className="mt-1 text-xs text-[#6B5A50]">{table.menu.name}</p> : null}
                  <div className="no-print mt-3 grid w-full grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => void downloadQR(table.qrCode!, table.tableNumber)}
                      className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#E7DDD2] bg-white px-3 py-2.5 text-sm font-semibold text-[#2A211C] hover:bg-[#FBF8F4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C4622D] active:scale-[0.98]"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => printCards(table.id)}
                      className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none bg-[#C4622D] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#A85224] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C4622D] active:scale-[0.98]"
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

  const fieldClass =
    'w-full rounded-xl border border-[#E7DDD2] bg-[#FBF8F4] px-3.5 py-2.5 text-sm text-[#1C1410] outline-none transition focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15';

  return (
    <div className="mx-auto max-w-6xl animate-fade-in overflow-x-clip pb-24 md:pb-12">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C4622D]">Floor setup</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1C1410] sm:text-3xl">
            Tables & QR codes
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[#6B5A50]">
            One QR per table. Guests scan, open the menu, and you see which table drove the visit.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tables.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setActionsOpen(false);
                setPrintMode(true);
              }}
              className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#E7DDD2] bg-white px-4 text-sm font-semibold text-[#1C1410] hover:bg-[#FBF8F4] sm:flex-none"
            >
              <Printer className="h-4 w-4 text-[#C4622D]" />
              Print stands
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-[#1C1410] px-4 text-sm font-semibold text-white hover:bg-[#2A211C] sm:flex-none"
          >
            <Plus className="h-4 w-4" />
            Add table
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatPill label="Tables" value={stats.tables} hint={stats.tables === 1 ? 'On the floor' : 'On the floor'} />
        <StatPill label="Total scans" value={stats.totalScans} hint="All table QRs" />
        <StatPill label="Unique scans" value={stats.uniqueScans} hint="Distinct visitors" />
        <StatPill
          label="Seats"
          value={stats.seats || '—'}
          hint={stats.topLabel ? `Top: ${stats.topLabel} (${stats.topScans})` : 'Capacity sum'}
        />
      </div>

      {/* Empty state */}
      {tables.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#E7DDD2] bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF4EC]">
            <QrCode className="h-7 w-7 text-[#C4622D]" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-[#1C1410]">No tables yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[#6B5A50]">
            Add your first table to generate a QR guests can scan from their seat.
          </p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="mt-5 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-[#C4622D] px-5 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Add your first table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tables.map((table) => {
            if (!table.qrCode) return null;
            const qr = table.qrCode;
            return (
              <article
                key={table.id}
                className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-[#E7DDD2] bg-white shadow-[0_1px_0_rgba(28,20,16,0.04)]"
              >
                <div className="hidden">
                  <CustomizableQRCode
                    id={`table-qr-${qr.shortCode}`}
                    value={getQrUrl(qr.shortCode)}
                    fgColor={qr.fgColor || '#000000'}
                    bgColor={qr.bgColor || '#FFFFFF'}
                    logoUrl={qr.logoUrl}
                    logoPreset={qr.customDesign?.logoPreset || 'none'}
                    frameId={qr.customDesign?.frameId || 'no_frame'}
                    frameText={qr.customDesign?.frameText || ''}
                    frameColor={qr.customDesign?.frameColor || '#001b50'}
                    frameTextColor={qr.customDesign?.frameTextColor || '#ffffff'}
                    size={500}
                  />
                </div>

                {/* Card top */}
                <div className="flex items-start justify-between gap-3 border-b border-[#F0E8DF] px-4 py-3.5 sm:px-5">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold tracking-tight text-[#1C1410]">
                      {table.tableNumber}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#6B5A50]">
                      {table.capacity ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F6F1EA] px-2 py-0.5 font-medium">
                          <Users className="h-3 w-3" />
                          {table.capacity} seats
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F6F1EA] px-2 py-0.5 font-medium">
                        <Link2 className="h-3 w-3" />
                        {table.menu?.name || 'Default menu'}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(table)}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#E7DDD2] bg-white text-[#6B5A50] hover:bg-[#FBF8F4]"
                      title="Edit table"
                      aria-label="Edit table"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTable(table.id)}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#E7DDD2] bg-white text-[#6B5A50] hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      title="Delete table"
                      aria-label="Delete table"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* QR + quick stats */}
                <div className="flex gap-4 px-4 py-4 sm:px-5">
                  <div className="flex h-[112px] w-[112px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E7DDD2] bg-[#FBF8F4] p-2">
                    <CustomizableQRCode
                      value={getQrUrl(qr.shortCode)}
                      fgColor={qr.fgColor || '#000000'}
                      bgColor={qr.bgColor || '#FFFFFF'}
                      logoUrl={qr.logoUrl}
                      logoPreset={qr.customDesign?.logoPreset || 'none'}
                      frameId={qr.customDesign?.frameId || 'no_frame'}
                      frameText={qr.customDesign?.frameText || ''}
                      frameColor={qr.customDesign?.frameColor || '#001b50'}
                      frameTextColor={qr.customDesign?.frameTextColor || '#ffffff'}
                      size={96}
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-[#FFF4EC] px-2.5 py-2">
                        <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#A85224]">
                          <ScanLine className="h-3 w-3" />
                          Scans
                        </p>
                        <p className="mt-0.5 text-xl font-semibold text-[#1C1410]">{qr.totalScans}</p>
                      </div>
                      <div className="rounded-xl bg-[#F6F1EA] px-2.5 py-2">
                        <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">
                          <Armchair className="h-3 w-3" />
                          Unique
                        </p>
                        <p className="mt-0.5 text-xl font-semibold text-[#1C1410]">{qr.uniqueScans}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl border border-[#E7DDD2] bg-[#FBF8F4] px-2.5 py-1.5">
                      <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[#6B5A50]">
                        /q/{qr.shortCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(table.id, qr.shortCode)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-[#6B5A50] hover:bg-white"
                        aria-label="Copy link"
                      >
                        {copiedId === table.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <a
                        href={getQrUrl(qr.shortCode)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B5A50] hover:bg-white"
                        aria-label="Open link"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Menu link */}
                <div className="border-t border-[#F0E8DF] px-4 py-3 sm:px-5">
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">
                    Linked menu
                  </label>
                  <select
                    value={table.menuId || ''}
                    onChange={(e) => handleLinkMenu(table.id, e.target.value)}
                    className={`${fieldClass} cursor-pointer py-2 text-xs font-semibold`}
                  >
                    <option value="">Default menu (fallback)</option>
                    {menus.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                        {m.isDefault ? ' (Default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[#F0E8DF] bg-[#FBF8F4] px-4 py-3 sm:px-5">
                  <button
                    type="button"
                    onClick={() => setSelectedDesignQr(qr)}
                    className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#E7DDD2] bg-white text-xs font-semibold text-[#1C1410] hover:bg-white"
                  >
                    <Palette className="h-3.5 w-3.5 text-[#C4622D]" />
                    Customize
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadQR(qr, table.tableNumber)}
                    className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none bg-[#1C1410] text-xs font-semibold text-white hover:bg-[#2A211C]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Mobile sticky add */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 p-4 md:hidden">
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="pointer-events-auto flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-none bg-[#1C1410] text-sm font-semibold text-white shadow-[0_12px_40px_rgba(28,20,16,0.28)]"
        >
          <Plus className="h-4 w-4" />
          Add table
        </button>
      </div>

      {/* Add table sheet / modal */}
      {showAddForm ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 cursor-pointer border-none bg-transparent"
            onClick={() => !addingTable && setShowAddForm(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-t-3xl border border-[#E7DDD2] bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#1C1410]">Add table</h2>
                <p className="text-xs text-[#6B5A50]">Creates a QR linked to this seat.</p>
              </div>
              <button
                type="button"
                disabled={addingTable}
                onClick={() => setShowAddForm(false)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#E7DDD2] bg-white text-[#6B5A50]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B5A50]">
                  Table label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Table 1, Patio A"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className={fieldClass}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B5A50]">
                  Seating capacity
                </label>
                <input
                  type="number"
                  placeholder="4"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  min={1}
                  max={999}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B5A50]">
                  Link to menu
                </label>
                <select
                  value={selectedMenuId}
                  onChange={(e) => setSelectedMenuId(e.target.value)}
                  className={`${fieldClass} cursor-pointer`}
                >
                  <option value="">Default menu (fallback)</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                      {m.isDefault ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={addingTable || !newTableNumber.trim()}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-[#C4622D] text-sm font-semibold text-white disabled:opacity-60"
              >
                {addingTable ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create table & QR
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* Edit Table Modal */}
      {editingTable ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 cursor-pointer border-none bg-transparent"
            onClick={() => !savingEdit && setEditingTable(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-t-3xl border border-[#E7DDD2] bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-[#1C1410]">Edit table</h3>
              <button
                type="button"
                onClick={() => setEditingTable(null)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#E7DDD2] bg-white text-[#6B5A50]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B5A50]">
                  Table label
                </label>
                <input
                  type="text"
                  value={editTableNumber}
                  onChange={(e) => setEditTableNumber(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B5A50]">
                  Seating capacity
                </label>
                <input
                  type="number"
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(e.target.value)}
                  min={1}
                  max={999}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B5A50]">
                  Link to menu
                </label>
                <select
                  value={editMenuId}
                  onChange={(e) => setEditMenuId(e.target.value)}
                  className={`${fieldClass} cursor-pointer`}
                >
                  <option value="">Default menu (fallback)</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                      {m.isDefault ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-2 border-t border-[#F0E8DF] pt-4">
              <button
                type="button"
                onClick={() => setEditingTable(null)}
                disabled={savingEdit}
                className="h-11 flex-1 cursor-pointer rounded-xl border border-[#E7DDD2] bg-white text-sm font-semibold text-[#1C1410] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit || !editTableNumber.trim()}
                className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none bg-[#1C1410] text-sm font-semibold text-white disabled:opacity-50"
              >
                {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedDesignQr ? (
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
              }),
            );
          }}
        />
      ) : null}
    </div>
  );
}
