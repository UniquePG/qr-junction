'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { auth } from '@/lib/firebase';
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
  FolderClosed
} from 'lucide-react';
import { toast } from 'react-toastify';

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
  variants?: { label: string; price: number }[] | null;
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

  // Verify restaurant & menus are configured
  const [restaurantExists, setRestaurantExists] = useState(false);

  useEffect(() => {
    const checkRestaurantAndMenus = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/restaurant/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.restaurant) {
            setRestaurantExists(true);
            
            // Fetch menus list
            const menusRes = await fetch('/api/restaurant/menus', {
              headers: { Authorization: `Bearer ${token}` }
            });
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
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });
      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Upload failed');
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
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/restaurant/scan-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fileUrl: url, fileType: type })
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'AI scanner request failed');
      }

      const json = await res.json();
      if (json.success && json.menu?.categories) {
        setParsedCategories(json.menu.categories);
        if (json.menu.categories.length > 0) {
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
    updated[catIdx].items.push({
      name: 'New Dish',
      description: '',
      price: 0,
      isVeg: true,
      isNonVeg: false,
      isVegan: false,
      isPopular: false,
      variants: null
    });
    setParsedCategories(updated);
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
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/restaurant/import-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          categories: parsedCategories,
          mode: importMode,
          menuId: selectedMenuId
        })
      });

      if (res.ok) {
        toast.success('Menu imported successfully!');
        router.push('/dashboard/restaurant/menu');
      } else {
        const json = await res.json();
        throw new Error(json.error || 'Import failed');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to import menu details.');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!restaurantExists || menus.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <AlertCircle className="w-12 h-12 text-primary/40 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#001B50] mb-2">Setup Restaurant & Menu First</h2>
        <p className="text-slate-500 mb-6">You need to set up your Restaurant profile settings and create a Menu before using the AI Menu Scanner.</p>
        <a 
          href="/dashboard/restaurant/profile" 
          className="bg-primary hover:bg-[#00143c] text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-sm"
        >
          Go to Profile Settings
        </a>
      </div>
    );
  }

  const activeCategory = activeReviewCatIdx !== null ? parsedCategories[activeReviewCatIdx] : null;

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#001B50] mb-2">AI Menu Scanner</h1>
        <p className="text-slate-600">Scan and extract dishes instantly from menu cards, images, or PDFs using advanced Vision AI models.</p>
      </div>

      {!fileUrl && !scanning && !uploading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Instructions Box */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-[#001B50] mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                How to Scan
              </h3>
              <ul className="space-y-3.5 text-slate-655 text-sm list-decimal pl-4">
                <li>Select the destination menu where you want to import scanned dishes.</li>
                <li>Upload an image of your physical menu (JPG, PNG) or upload a PDF document.</li>
                <li>Our AI will analyze the text structure and extract dishes, descriptions, and pricing.</li>
                <li>Review the extracted items, modify names or prices, and customize categories.</li>
                <li>Import the verified menu directly to your live website inventory database.</li>
              </ul>
            </div>

            {/* Select Destination Menu */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <FolderClosed className="w-4 h-4 text-primary" />
                Destination Menu
              </h3>
              <p className="text-xs text-slate-500">Choose the menu where scanned items will be written:</p>
              <select
                value={selectedMenuId || ''}
                onChange={(e) => setSelectedMenuId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2 px-3 text-sm text-slate-800 outline-none cursor-pointer"
              >
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-amber-50/50 border border-amber-250 rounded-2xl p-6 text-amber-800 text-xs flex gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
              <div>
                <span className="font-bold">Important tips for best results:</span>
                <p className="mt-1 leading-relaxed">Ensure text is legible, aligned, and prices are clearly listed next to dish names. For multi-page PDF documents, only text-based formats are recommended.</p>
              </div>
            </div>
          </div>

          {/* Upload Box */}
          <div className="lg:col-span-2">
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileUpload}
              className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center shadow-sm hover:border-primary transition-all flex flex-col items-center justify-center min-h-[350px] group cursor-pointer relative"
            >
              <input 
                type="file" 
                id="menu-file-input" 
                accept="image/*, application/pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
              <div className="bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center text-primary group-hover:scale-105 transition-transform mb-4">
                <Upload className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">Upload your menu document</h4>
              <p className="text-slate-500 text-sm mt-1 max-w-sm">Drag and drop files here, or click to browse files from your computer.</p>
              <span className="inline-block mt-6 px-3 py-1 bg-slate-100 rounded-full text-slate-500 text-xs font-semibold">Supports JPG, PNG, WEBP, or PDF (Max 5MB)</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading Screen */}
      {(uploading || scanning) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h3 className="font-bold text-[#001B50] text-lg">
            {uploading ? 'Uploading menu file...' : 'Scanning Menu with Vision AI...'}
          </h3>
          <p className="text-slate-500 text-sm mt-1.5 max-w-md">
            {uploading 
              ? 'Hosting your file securely in the cloud...' 
              : 'Our LLM is extracting categories, dishes, prices, and dietary tags. This may take up to 10-15 seconds. Please do not close this page.'}
          </p>
          {fileName && (
            <span className="inline-flex items-center gap-1.5 mt-6 px-4 py-1.5 bg-slate-50 text-slate-650 rounded-lg text-xs font-semibold border border-slate-200">
              <FileText className="w-3.5 h-3.5 text-slate-450" />
              {fileName}
            </span>
          )}
        </div>
      )}

      {/* Live AI Review Screen */}
      {!uploading && !scanning && parsedCategories.length > 0 && (
        <div className="space-y-6">
          {/* Review Header Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 text-emerald-655 rounded-full w-10 h-10 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[#001B50]">AI Review Verification</h3>
                <p className="text-xs text-slate-500">Verify values before importing.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Destination Menu Selector */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <FolderClosed className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Destination:</span>
                <select
                  value={selectedMenuId || ''}
                  onChange={(e) => setSelectedMenuId(Number(e.target.value))}
                  className="bg-transparent font-bold text-[#001B50] outline-none cursor-pointer"
                >
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Overwrite or Append toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setImportMode('append')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    importMode === 'append' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Append Menu
                </button>
                <button
                  onClick={() => setImportMode('overwrite')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    importMode === 'overwrite' ? 'bg-white text-red-655 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Overwrite Menu
                </button>
              </div>

              <button
                onClick={handleImport}
                disabled={importing}
                className="bg-primary hover:bg-[#00143c] text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 border-none cursor-pointer"
              >
                {importing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Import Menu ({parsedCategories.reduce((acc, cat) => acc + (cat.items?.length || 0), 0)} Items)
              </button>

              <button
                onClick={() => {
                  setParsedCategories([]);
                  setFileUrl(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all border border-slate-200 cursor-pointer"
              >
                Reset / Re-Upload
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Parsed Categories Panel */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-fit">
              <div className="flex items-center justify-between mb-4 px-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Categories</h4>
                <button 
                  onClick={handleAddCategory}
                  className="p-1 text-primary hover:bg-primary/5 rounded-lg"
                  title="Add Category"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {parsedCategories.map((cat, idx) => {
                  const isSelected = activeReviewCatIdx === idx;
                  const isEditing = editingCatIdx === idx;
                  return (
                    <div 
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-xl group transition-all ${
                        isSelected 
                          ? 'bg-primary/5 text-primary border border-primary/20' 
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <input 
                            type="text" 
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            className="w-full bg-white border border-slate-350 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleRenameCategory(idx)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setEditingCatIdx(null)}
                            className="p-1 text-red-655 hover:bg-red-50 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setActiveReviewCatIdx(idx)}
                            className="flex-1 text-left font-semibold text-xs truncate pl-1 pr-2 cursor-pointer"
                          >
                            {cat.name}
                            <span className="text-[10px] text-slate-400 font-normal ml-1">({cat.items?.length || 0})</span>
                          </button>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingCatIdx(idx);
                                setEditingCatName(cat.name);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(idx)}
                              className="p-1 text-red-655 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Parsed Items Panel */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              {activeCategory ? (
                <div className="space-y-6">
                  {/* Category Details bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-bold text-lg text-[#001B50]">
                        {activeCategory.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Configure items inside this extracted category.</p>
                    </div>
                    <button
                      onClick={() => handleAddItem(activeReviewCatIdx!)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/15 text-primary font-bold rounded-xl text-xs transition-colors cursor-pointer border-none"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Dish
                    </button>
                  </div>

                  {activeCategory.items.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs">No items inside this category. Click Add Dish above to create.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeCategory.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row gap-4 items-start relative group hover:border-slate-300 transition-all">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                            <div className="md:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Dish Name</label>
                              <input 
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateItem(activeReviewCatIdx!, itemIdx, { name: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-sans focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Price</label>
                              <input 
                                type="number"
                                value={item.price}
                                onChange={(e) => handleUpdateItem(activeReviewCatIdx!, itemIdx, { price: Number(e.target.value) })}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-sans focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Diet Type</label>
                              <select
                                value={item.isNonVeg ? 'nonveg' : 'veg'}
                                onChange={(e) => handleUpdateItem(activeReviewCatIdx!, itemIdx, { 
                                  isVeg: e.target.value === 'veg', 
                                  isNonVeg: e.target.value === 'nonveg' 
                                })}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-850 focus:outline-none"
                              >
                                <option value="veg">Veg</option>
                                <option value="nonveg">Non-Veg</option>
                              </select>
                            </div>

                            <div className="md:col-span-4">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Description (Ingredients / Details)</label>
                              <input 
                                type="text"
                                value={item.description || ''}
                                onChange={(e) => handleUpdateItem(activeReviewCatIdx!, itemIdx, { description: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-sans focus:outline-none"
                                placeholder="Ingredients, prep details..."
                              />
                            </div>

                            {/* Variants Section */}
                            <div className="md:col-span-4 border-t border-slate-200/60 pt-3 mt-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Size / Portion Variants</label>
                                  <p className="text-[9px] text-slate-400">e.g. Half ₹120 · Full ₹200</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = item.variants || [];
                                    handleUpdateItem(activeReviewCatIdx!, itemIdx, {
                                      variants: [...current, { label: '', price: 0 }]
                                    });
                                  }}
                                  className="flex items-center gap-1 text-primary hover:text-primary/80 font-bold text-[10px] cursor-pointer bg-transparent border-none outline-none"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add Size
                                </button>
                              </div>

                              {item.variants && item.variants.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                  {item.variants.map((variant, vi) => (
                                    <div key={vi} className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5 pl-2.5">
                                      <input
                                        type="text"
                                        value={variant.label}
                                        onChange={(e) => {
                                          const updated = [...(item.variants || [])];
                                          updated[vi] = { ...updated[vi], label: e.target.value };
                                          handleUpdateItem(activeReviewCatIdx!, itemIdx, { variants: updated });
                                        }}
                                        placeholder="e.g. Half"
                                        className="w-1/2 bg-transparent border-none text-xs text-slate-800 focus:outline-none min-w-0"
                                      />
                                      <div className="w-[1px] h-4 bg-slate-200 shrink-0"></div>
                                      <div className="flex items-center gap-0.5 w-1/2 min-w-0">
                                        <span className="text-[10px] text-slate-400 shrink-0">₹</span>
                                        <input
                                          type="number"
                                          value={variant.price === 0 ? '' : variant.price}
                                          onChange={(e) => {
                                            const updated = [...(item.variants || [])];
                                            updated[vi] = { ...updated[vi], price: Number(e.target.value) };
                                            handleUpdateItem(activeReviewCatIdx!, itemIdx, { variants: updated });
                                          }}
                                          placeholder="0"
                                          className="w-full bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none min-w-0"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = (item.variants || []).filter((_, i) => i !== vi);
                                          handleUpdateItem(activeReviewCatIdx!, itemIdx, {
                                            variants: updated.length > 0 ? updated : null
                                          });
                                        }}
                                        className="text-red-400 hover:text-red-655 p-0.5 rounded cursor-pointer shrink-0 transition-colors bg-transparent border-none"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[10px] text-slate-400 italic">No size variants. Click "Add Size" to create multiple price tiers.</p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteItem(activeReviewCatIdx!, itemIdx)}
                            className="self-end md:self-center p-2 text-red-655 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-450">
                  <p className="text-sm">Select a category on the left to review its extracted dishes.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
