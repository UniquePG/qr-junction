'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { restaurantService, uploadService } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  Loader2, 
  CheckCircle2, 
  FileText, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Edit, 
  Check, 
  X,
  Info,
  FolderClosed,
  ImageIcon,
  Sparkles,
  Leaf
} from 'lucide-react';
import { toast } from '@/lib/toast';

interface Menu {
  id: number;
  name: string;
  isDefault: boolean;
}

interface ParsedItem {
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  isNonVeg: boolean;
  isVegan: boolean;
  isPopular: boolean;
  image?: string | null;
  variants?: { label: string; price: number }[] | null;
}

function emptyParsedItem(): ParsedItem {
  return {
    name: 'New Dish',
    description: '',
    price: 0,
    isVeg: true,
    isNonVeg: false,
    isVegan: false,
    isPopular: false,
    image: null,
    variants: null,
  };
}

function normalizeParsedItem(item: Partial<ParsedItem> | null | undefined): ParsedItem {
  const source = item || {};
  return {
    name: source.name?.trim() || 'New Dish',
    description: source.description || '',
    price: Number(source.price) || 0,
    isVeg: source.isNonVeg ? false : source.isVeg !== false,
    isNonVeg: Boolean(source.isNonVeg),
    isVegan: Boolean(source.isVegan),
    isPopular: Boolean(source.isPopular),
    image: source.image || null,
    variants: Array.isArray(source.variants) && source.variants.length > 0 ? source.variants : null,
  };
}


interface ParsedCategory {
  name: string;
  items: ParsedItem[];
}

export default function AIScannerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [importing, setImporting] = useState(false);
  
  // File details
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');

  // Menus list
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);

  // Parsed results review
  const [parsedCategories, setParsedCategories] = useState<ParsedCategory[]>([]);
  const [activeReviewCatIdx, setActiveReviewCatIdx] = useState<number | null>(null);
  const [editingCatIdx, setEditingCatIdx] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  
  // Import Options
  const [importMode, setImportMode] = useState<'append' | 'overwrite'>('append');
  const [busyImageKey, setBusyImageKey] = useState<string | null>(null);
  const [generatingImageKey, setGeneratingImageKey] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Verify restaurant & menus are configured
  const [restaurantExists, setRestaurantExists] = useState(false);

  useEffect(() => {
    const checkRestaurantAndMenus = async () => {
      try {
        const res = await restaurantService.getProfile();
        if (res.ok) {
          const json = await res.json();
          if (json.restaurant) {
            setRestaurantExists(true);
            
            // Fetch menus list
            const menusRes = await restaurantService.listMenus();
            if (menusRes.ok) {
              const menusJson = await menusRes.json();
              setMenus(menusJson.menus || []);
              if (menusJson.menus?.length > 0) {
                const defaultMenu = menusJson.menus.find((m: Menu) => m.isDefault) || menusJson.menus[0];
                setSelectedMenuId(defaultMenu.id);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error verifying restaurant:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkRestaurantAndMenus();
    }
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file: File | undefined;

    if ('dataTransfer' in e) {
      e.preventDefault();
      file = e.dataTransfer.files?.[0];
    } else {
      file = e.target.files?.[0];
    }

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be smaller than 5MB.');
      return;
    }

    setUploading(true);
    setFileName(file.name);
    setFileType(file.type);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await uploadService.file(uploadData);
      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      if (!json.success) throw new Error(json.message || json.error || 'Upload failed');
      setFileUrl(json.url);
      toast.success('File uploaded! Starting AI Menu Scanner...');
      await runScanner(json.url, file.type);
    } catch (err) {
      console.error(err);
      toast.error('File upload failed.');
      setUploading(false);
    }
  };

  const runScanner = async (url: string, type: string) => {
    setScanning(true);
    try {
      const res = await restaurantService.scanMenu({ fileUrl: url, fileType: type });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || json.error || 'AI scanner request failed');
      }

      const json = await res.json();
      if (json.success && json.menu?.categories) {
        const categories = json.menu.categories.map((cat: ParsedCategory) => ({
          name: cat.name?.trim() || 'New Category',
          items: (cat.items || []).map((item) => normalizeParsedItem(item)),
        }));
        setParsedCategories(categories);
        if (categories.length > 0) {
          setActiveReviewCatIdx(0);
        }
        toast.success('AI Menu extraction complete! Please review the results below.');
      } else {
        throw new Error('Could not extract categories. Check if document contains menu text.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'AI Scanner failed to parse menu.');
      setFileUrl(null);
    } finally {
      setUploading(false);
      setScanning(false);
    }
  };

  // Review screen operations
  const handleRenameCategory = (idx: number) => {
    if (!editingCatName.trim()) return;
    const updated = [...parsedCategories];
    updated[idx].name = editingCatName;
    setParsedCategories(updated);
    setEditingCatIdx(null);
    toast.success('Category renamed.');
  };

  const handleDeleteCategory = (idx: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    const updated = parsedCategories.filter((_, i) => i !== idx);
    setParsedCategories(updated);
    setActiveReviewCatIdx(updated.length > 0 ? 0 : null);
  };

  const handleAddCategory = () => {
    const name = prompt('Enter new category name:');
    if (!name || !name.trim()) return;
    const newCat: ParsedCategory = { name: name.trim(), items: [] };
    setParsedCategories(prev => [...prev, newCat]);
    setActiveReviewCatIdx(parsedCategories.length);
  };

  const handleUpdateItem = (catIdx: number, itemIdx: number, fields: Partial<ParsedItem>) => {
    const updated = [...parsedCategories];
    updated[catIdx].items[itemIdx] = {
      ...updated[catIdx].items[itemIdx],
      ...fields
    };
    setParsedCategories(updated);
  };

  const handleDeleteItem = (catIdx: number, itemIdx: number) => {
    const updated = [...parsedCategories];
    updated[catIdx].items = updated[catIdx].items.filter((_, i) => i !== itemIdx);
    setParsedCategories(updated);
  };

  const handleAddItem = (catIdx: number) => {
    const updated = [...parsedCategories];
    updated[catIdx].items.push(emptyParsedItem());
    setParsedCategories(updated);
  };

  const itemKey = (catIdx: number, itemIdx: number) => `${catIdx}-${itemIdx}`;

  const handleUploadDishImage = async (
    catIdx: number,
    itemIdx: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error('Image must be 1MB or smaller.');
      return;
    }

    const key = itemKey(catIdx, itemIdx);
    setBusyImageKey(key);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await uploadService.file(uploadData);
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.message || json.error || 'Upload failed');
      handleUpdateItem(catIdx, itemIdx, { image: json.url });
      toast.success('Dish photo uploaded.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image.');
    } finally {
      setBusyImageKey(null);
    }
  };

  const handleGenerateDishImage = async (catIdx: number, itemIdx: number) => {
    const item = parsedCategories[catIdx]?.items[itemIdx];
    const itemName = item?.name?.trim();
    if (!itemName || itemName === 'New Dish') {
      toast.error('Enter the dish name first, then generate an image.');
      return;
    }

    const key = itemKey(catIdx, itemIdx);
    setGeneratingImageKey(key);
    try {
      const res = await restaurantService.generateImage({ itemName });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.message || json.error || 'Failed to generate image.');
      handleUpdateItem(catIdx, itemIdx, { image: json.url });
      toast.success('AI dish photo added.');
    } catch (err: any) {
      toast.error(err.message || 'Error generating AI image.');
    } finally {
      setGeneratingImageKey(null);
    }
  };

  const handleClearDishImage = (catIdx: number, itemIdx: number) => {
    handleUpdateItem(catIdx, itemIdx, { image: null });
  };

  const handleImport = async () => {
    if (parsedCategories.length === 0) {
      toast.error('No categories to import.');
      return;
    }

    if (!selectedMenuId) {
      toast.error('Please select a destination menu first.');
      return;
    }

    setImporting(true);
    try {
      const res = await restaurantService.importMenu({
        categories: parsedCategories,
        mode: importMode,
        menuId: selectedMenuId,
      });

      if (res.ok) {
        toast.success('Menu imported successfully!');
        router.push('/dashboard/restaurant/menu');
      } else {
        const json = await res.json();
        throw new Error(json.message || json.error || 'Import failed');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to import menu details.');
    } finally {
      setImporting(false);
    }
  };

  const totalItems = parsedCategories.reduce((acc, cat) => acc + (cat.items?.length || 0), 0);
  const fieldClass =
    'w-full min-w-0 rounded-xl border border-[#E7DDD2] bg-[#FBF8F4] px-3 py-2 text-sm text-[#1C1410] outline-none transition focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15';

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4622D]" />
      </div>
    );
  }

  if (!restaurantExists || menus.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-[#E7DDD2] bg-white px-6 py-12 text-center shadow-[0_1px_0_rgba(28,20,16,0.04)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF4EC]">
          <AlertCircle className="h-7 w-7 text-[#C4622D]" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-[#1C1410]">Set up restaurant & menu first</h2>
        <p className="mt-2 text-sm text-[#6B5A50]">
          Create your restaurant profile and at least one menu before scanning paper menus with AI.
        </p>
        <a
          href="/dashboard/restaurant/profile"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#1C1410] px-5 text-sm font-semibold text-white no-underline"
        >
          Go to profile
        </a>
      </div>
    );
  }

  const activeCategory = activeReviewCatIdx !== null ? parsedCategories[activeReviewCatIdx] : null;

  return (
    <div className="mx-auto max-w-6xl animate-fade-in overflow-x-clip pb-28 md:pb-12">
      <div className="mb-6 sm:mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C4622D]">Premium import</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1C1410] sm:text-3xl">AI Menu Scanner</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#6B5A50]">
          Photograph a paper menu or drop a PDF. AI extracts dishes — you review, polish, then import.
        </p>
      </div>

      {!fileUrl && !scanning && !uploading && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
          <div className="space-y-4 lg:col-span-4">
            <div className="rounded-3xl border border-[#E7DDD2] bg-white p-5 shadow-[0_1px_0_rgba(28,20,16,0.04)]">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF4EC]">
                  <Sparkles className="h-4 w-4 text-[#C4622D]" />
                </div>
                <h3 className="font-semibold text-[#1C1410]">How it works</h3>
              </div>
              <ol className="space-y-3">
                {[
                  'Pick the destination menu',
                  'Upload a clear photo or PDF',
                  'AI extracts categories & dishes',
                  'Review prices, tags, and photos',
                  'Import to your live menu',
                ].map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm text-[#6B5A50]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1C1410] text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-3xl border border-[#E7DDD2] bg-white p-5 shadow-[0_1px_0_rgba(28,20,16,0.04)]">
              <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8A7568]">
                <FolderClosed className="h-3.5 w-3.5" />
                Destination menu
              </label>
              <select
                value={selectedMenuId || ''}
                onChange={(e) => setSelectedMenuId(Number(e.target.value))}
                className={`${fieldClass} cursor-pointer`}
              >
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 rounded-3xl border border-[#E8C4AE] bg-[#FFF8F3] p-4 text-xs text-[#7A4A2A]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#C4622D]" />
              <p className="leading-relaxed">
                <span className="font-semibold text-[#1C1410]">Tip: </span>
                Shoot the menu straight-on with readable prices. Skip blurry or heavily stylized pages for best extraction.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileUpload}
              className="group relative flex min-h-[360px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-[#E7DDD2] bg-gradient-to-b from-white to-[#FBF8F4] px-6 py-14 text-center transition hover:border-[#C4622D]/50"
            >
              <input
                type="file"
                id="menu-file-input"
                accept="image/*, application/pdf"
                className="absolute inset-0 z-10 cursor-pointer opacity-0"
                onChange={handleFileUpload}
              />
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1C1410] text-white shadow-lg transition group-hover:scale-105">
                <Upload className="h-7 w-7" />
              </div>
              <h4 className="text-xl font-semibold tracking-tight text-[#1C1410]">Drop your menu here</h4>
              <p className="mt-2 max-w-md text-sm text-[#6B5A50]">
                Drag a photo or PDF, or tap to browse. We will extract dishes for you to verify.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {['JPG', 'PNG', 'WEBP', 'PDF'].map((fmt) => (
                  <span
                    key={fmt}
                    className="rounded-full border border-[#E7DDD2] bg-white px-3 py-1 text-[11px] font-semibold text-[#6B5A50]"
                  >
                    {fmt}
                  </span>
                ))}
                <span className="rounded-full bg-[#FFF4EC] px-3 py-1 text-[11px] font-semibold text-[#C4622D]">
                  Max 5MB
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {(uploading || scanning) && (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-[#E7DDD2] bg-white px-6 py-16 text-center shadow-[0_1px_0_rgba(28,20,16,0.04)]">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-ping rounded-full bg-[#C4622D]/20" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF4EC]">
              <Loader2 className="h-8 w-8 animate-spin text-[#C4622D]" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-[#1C1410]">
            {uploading ? 'Uploading your menu…' : 'Reading the menu with AI…'}
          </h3>
          <p className="mt-2 max-w-md text-sm text-[#6B5A50]">
            {uploading
              ? 'Securing the file, then starting extraction.'
              : 'Pulling categories, dish names, prices, and diet tags. Usually under 15 seconds — keep this tab open.'}
          </p>
          {fileName ? (
            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#E7DDD2] bg-[#FBF8F4] px-4 py-2 text-xs font-semibold text-[#6B5A50]">
              <FileText className="h-3.5 w-3.5 text-[#C4622D]" />
              {fileName}
            </span>
          ) : null}
        </div>
      )}

      {!uploading && !scanning && parsedCategories.length > 0 && (
        <div className="space-y-5">
          <div className="rounded-3xl border border-[#E7DDD2] bg-white p-4 shadow-[0_1px_0_rgba(28,20,16,0.04)] sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#1C1410]">Review before import</h3>
                  <p className="text-xs text-[#6B5A50]">
                    {parsedCategories.length} {parsedCategories.length === 1 ? 'category' : 'categories'} · {totalItems}{' '}
                    {totalItems === 1 ? 'dish' : 'dishes'} extracted
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="flex min-w-0 items-center gap-2 rounded-xl border border-[#E7DDD2] bg-[#FBF8F4] px-3 py-2 text-xs">
                  <FolderClosed className="h-3.5 w-3.5 shrink-0 text-[#8A7568]" />
                  <select
                    value={selectedMenuId || ''}
                    onChange={(e) => setSelectedMenuId(Number(e.target.value))}
                    className="min-w-0 flex-1 cursor-pointer bg-transparent font-semibold text-[#1C1410] outline-none"
                  >
                    {menus.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex rounded-xl bg-[#F6F1EA] p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`flex-1 cursor-pointer rounded-lg border-none px-3 py-2 transition sm:flex-none ${
                      importMode === 'append' ? 'bg-white text-[#C4622D] shadow-sm' : 'bg-transparent text-[#6B5A50]'
                    }`}
                  >
                    Append
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode('overwrite')}
                    className={`flex-1 cursor-pointer rounded-lg border-none px-3 py-2 transition sm:flex-none ${
                      importMode === 'overwrite' ? 'bg-white text-red-600 shadow-sm' : 'bg-transparent text-[#6B5A50]'
                    }`}
                  >
                    Overwrite
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setParsedCategories([]);
                      setFileUrl(null);
                    }}
                    className="h-10 flex-1 cursor-pointer rounded-xl border border-[#E7DDD2] bg-white px-3 text-xs font-semibold text-[#1C1410] sm:flex-none"
                  >
                    Re-upload
                  </button>
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={importing || Boolean(busyImageKey || generatingImageKey)}
                    className="inline-flex h-10 flex-[1.4] cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none bg-[#C4622D] px-4 text-xs font-semibold text-white disabled:opacity-50 sm:flex-none"
                  >
                    {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    Import {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Categories — horizontal chips on mobile, sidebar on desktop */}
            <div className="h-fit rounded-3xl border border-[#E7DDD2] bg-white p-4 shadow-[0_1px_0_rgba(28,20,16,0.04)] lg:sticky lg:top-4 lg:col-span-3 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
              <div className="mb-3 flex items-center justify-between px-1">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A7568]">Categories</h4>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#E7DDD2] bg-[#FBF8F4] text-[#C4622D]"
                  title="Add category"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {parsedCategories.map((cat, idx) => {
                  const isSelected = activeReviewCatIdx === idx;
                  const isEditing = editingCatIdx === idx;
                  return (
                    <div
                      key={idx}
                      className={`min-w-[140px] shrink-0 rounded-2xl border p-2.5 transition lg:min-w-0 ${
                        isSelected
                          ? 'border-[#C4622D]/30 bg-[#FFF4EC]'
                          : 'border-transparent bg-[#FBF8F4] hover:border-[#E7DDD2]'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            className="w-full rounded-lg border border-[#E7DDD2] bg-white px-2 py-1 text-xs outline-none"
                            autoFocus
                          />
                          <button type="button" onClick={() => handleRenameCategory(idx)} className="cursor-pointer border-none bg-transparent p-1 text-emerald-600">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={() => setEditingCatIdx(null)} className="cursor-pointer border-none bg-transparent p-1 text-red-500">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setActiveReviewCatIdx(idx)}
                            className="min-w-0 flex-1 cursor-pointer truncate border-none bg-transparent text-left text-xs font-semibold text-[#1C1410]"
                          >
                            {cat.name}
                            <span className="ml-1 font-normal text-[#8A7568]">({cat.items?.length || 0})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatIdx(idx);
                              setEditingCatName(cat.name);
                            }}
                            className="cursor-pointer border-none bg-transparent p-1 text-[#8A7568] hover:text-[#C4622D]"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(idx)}
                            className="cursor-pointer border-none bg-transparent p-1 text-[#8A7568] hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-[#E7DDD2] bg-white p-4 shadow-[0_1px_0_rgba(28,20,16,0.04)] sm:p-6 lg:col-span-9">
              {activeCategory ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0E8DF] pb-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-[#1C1410]">{activeCategory.name}</h3>
                      <p className="text-xs text-[#6B5A50]">Check names, prices, and photos before import.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddItem(activeReviewCatIdx!)}
                      className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border-none bg-[#1C1410] px-3.5 text-xs font-semibold text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add dish
                    </button>
                  </div>

                  {activeCategory.items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#E7DDD2] py-12 text-center text-sm text-[#8A7568]">
                      No dishes here yet. Add one to continue.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeCategory.items.map((item, itemIdx) => {
                        const key = itemKey(activeReviewCatIdx!, itemIdx);
                        const uploadingImg = busyImageKey === key;
                        const generating = generatingImageKey === key;
                        const imageBusy = uploadingImg || generating;
                        const inputId = `review-dish-image-${activeReviewCatIdx}-${itemIdx}`;

                        return (
                          <div
                            key={itemIdx}
                            className="relative min-w-0 overflow-hidden rounded-3xl border border-[#E7DDD2] bg-[#FBF8F4] p-4 sm:p-5"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                              <div className="w-full shrink-0 space-y-2 sm:w-[108px]">
                                <button
                                  type="button"
                                  onClick={() => item.image && setPreviewImage(item.image)}
                                  className={`relative flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border border-[#E7DDD2] bg-white sm:h-24 sm:w-24 ${
                                    item.image ? 'cursor-zoom-in' : 'cursor-default'
                                  }`}
                                  aria-label={item.image ? 'Preview dish image' : 'No dish image'}
                                >
                                  {item.image ? (
                                    <img src={item.image} alt={item.name || 'Dish'} className="h-full w-full object-cover" />
                                  ) : (
                                    <ImageIcon className="h-7 w-7 text-[#D4C4B5]" />
                                  )}
                                  {imageBusy ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                                      <Loader2 className="h-5 w-5 animate-spin text-[#C4622D]" />
                                    </div>
                                  ) : null}
                                </button>
                                <div className="flex gap-1.5 sm:flex-col">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    id={inputId}
                                    className="hidden"
                                    disabled={imageBusy}
                                    onChange={(e) => handleUploadDishImage(activeReviewCatIdx!, itemIdx, e)}
                                  />
                                  <label
                                    htmlFor={inputId}
                                    className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border border-[#E7DDD2] bg-white px-2 py-1.5 text-[10px] font-semibold text-[#1C1410] sm:flex-none ${
                                      imageBusy ? 'pointer-events-none opacity-50' : ''
                                    }`}
                                  >
                                    <Plus className="h-3 w-3" />
                                    Upload
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => handleGenerateDishImage(activeReviewCatIdx!, itemIdx)}
                                    disabled={imageBusy}
                                    className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border-none bg-[#FFF4EC] px-2 py-1.5 text-[10px] font-semibold text-[#C4622D] disabled:opacity-50 sm:flex-none"
                                  >
                                    <Sparkles className="h-3 w-3" />
                                    {generating ? '…' : 'AI photo'}
                                  </button>
                                  {item.image ? (
                                    <button
                                      type="button"
                                      onClick={() => handleClearDishImage(activeReviewCatIdx!, itemIdx)}
                                      disabled={imageBusy}
                                      className="cursor-pointer border-none bg-transparent px-1 text-[10px] font-semibold text-[#8A7568] hover:text-red-500 disabled:opacity-50"
                                    >
                                      Remove
                                    </button>
                                  ) : null}
                                </div>
                              </div>

                              <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-4">
                                <div className="min-w-0 md:col-span-2">
                                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Dish name</label>
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => handleUpdateItem(activeReviewCatIdx!, itemIdx, { name: e.target.value })}
                                    className={fieldClass}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Price</label>
                                  <input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => handleUpdateItem(activeReviewCatIdx!, itemIdx, { price: Number(e.target.value) })}
                                    className={fieldClass}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Diet</label>
                                  <select
                                    value={item.isNonVeg ? 'nonveg' : 'veg'}
                                    onChange={(e) =>
                                      handleUpdateItem(activeReviewCatIdx!, itemIdx, {
                                        isVeg: e.target.value === 'veg',
                                        isNonVeg: e.target.value === 'nonveg',
                                        isVegan: e.target.value === 'nonveg' ? false : item.isVegan,
                                      })
                                    }
                                    className={`${fieldClass} cursor-pointer`}
                                  >
                                    <option value="veg">Veg</option>
                                    <option value="nonveg">Non-Veg</option>
                                  </select>
                                </div>
                                <div className="min-w-0 md:col-span-4">
                                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Description</label>
                                  <input
                                    type="text"
                                    value={item.description || ''}
                                    onChange={(e) => handleUpdateItem(activeReviewCatIdx!, itemIdx, { description: e.target.value })}
                                    className={fieldClass}
                                    placeholder="Ingredients, prep details…"
                                  />
                                </div>
                                <div className="min-w-0 md:col-span-4">
                                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Tags</label>
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateItem(activeReviewCatIdx!, itemIdx, {
                                          isVegan: !item.isVegan,
                                          isVeg: !item.isVegan ? true : item.isVeg,
                                          isNonVeg: !item.isVegan ? false : item.isNonVeg,
                                        })
                                      }
                                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                                        item.isVegan
                                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                          : 'border-[#E7DDD2] bg-white text-[#6B5A50]'
                                      }`}
                                    >
                                      <Leaf className="h-3.5 w-3.5" />
                                      Vegan
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateItem(activeReviewCatIdx!, itemIdx, { isPopular: !item.isPopular })}
                                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                                        item.isPopular
                                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                                          : 'border-[#E7DDD2] bg-white text-[#6B5A50]'
                                      }`}
                                    >
                                      <Sparkles className="h-3.5 w-3.5" />
                                      Popular
                                    </button>
                                  </div>
                                </div>
                                <div className="min-w-0 border-t border-[#E7DDD2]/80 pt-3 md:col-span-4">
                                  <div className="mb-2 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <label className="block text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Size variants</label>
                                      <p className="text-[10px] text-[#A89484]">e.g. Half ₹120 · Full ₹200</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const current = item.variants || [];
                                        handleUpdateItem(activeReviewCatIdx!, itemIdx, {
                                          variants: [...current, { label: '', price: 0 }],
                                        });
                                      }}
                                      className="inline-flex shrink-0 cursor-pointer items-center gap-1 border-none bg-transparent text-[10px] font-bold text-[#C4622D]"
                                    >
                                      <Plus className="h-3 w-3" />
                                      Add size
                                    </button>
                                  </div>
                                  {item.variants && item.variants.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                                      {item.variants.map((variant, vi) => (
                                        <div
                                          key={vi}
                                          className="flex min-w-0 items-center gap-2 rounded-xl border border-[#E7DDD2] bg-white p-1.5 pl-2.5"
                                        >
                                          <input
                                            type="text"
                                            value={variant.label}
                                            onChange={(e) => {
                                              const updated = [...(item.variants || [])];
                                              updated[vi] = { ...updated[vi], label: e.target.value };
                                              handleUpdateItem(activeReviewCatIdx!, itemIdx, { variants: updated });
                                            }}
                                            placeholder="Half"
                                            className="min-w-0 w-1/2 border-none bg-transparent text-xs outline-none"
                                          />
                                          <div className="h-4 w-px shrink-0 bg-[#E7DDD2]" />
                                          <div className="flex min-w-0 w-1/2 items-center gap-0.5">
                                            <span className="shrink-0 text-[10px] text-[#8A7568]">₹</span>
                                            <input
                                              type="number"
                                              value={variant.price === 0 ? '' : variant.price}
                                              onChange={(e) => {
                                                const updated = [...(item.variants || [])];
                                                updated[vi] = { ...updated[vi], price: Number(e.target.value) };
                                                handleUpdateItem(activeReviewCatIdx!, itemIdx, { variants: updated });
                                              }}
                                              placeholder="0"
                                              className="min-w-0 w-full border-none bg-transparent text-xs font-semibold outline-none"
                                            />
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updated = (item.variants || []).filter((_, i) => i !== vi);
                                              handleUpdateItem(activeReviewCatIdx!, itemIdx, {
                                                variants: updated.length > 0 ? updated : null,
                                              });
                                            }}
                                            className="shrink-0 cursor-pointer border-none bg-transparent p-0.5 text-red-400 hover:text-red-600"
                                          >
                                            <X className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-[10px] italic text-[#A89484]">No size variants yet.</p>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteItem(activeReviewCatIdx!, itemIdx)}
                                className="absolute right-3 top-3 cursor-pointer rounded-xl border-none bg-white/80 p-2 text-red-500 hover:bg-red-50 sm:static sm:self-start"
                                aria-label="Delete dish"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-[#8A7568]">Pick a category to review dishes.</div>
              )}
            </div>
          </div>

          {/* Mobile sticky import */}
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 p-4 md:hidden">
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || Boolean(busyImageKey || generatingImageKey)}
              className="pointer-events-auto flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-none bg-[#C4622D] text-sm font-semibold text-white shadow-[0_12px_40px_rgba(196,98,45,0.35)] disabled:opacity-50"
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Import {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </button>
          </div>
        </div>
      )}

      {previewImage ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 cursor-pointer rounded-full border-none bg-white/10 p-2.5 text-white hover:bg-white/20"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewImage}
              alt="Dish preview"
              className="max-h-[75vh] max-w-full rounded-xl bg-white object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
