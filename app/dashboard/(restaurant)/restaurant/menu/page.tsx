'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { restaurantService, uploadService } from '@/lib/api';
import { getQrUrl } from '@/utils/qrUrl';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Loader2, 
  Check, 
  X, 
  Utensils, 
  ImageIcon, 
  ShoppingBag,
  Sparkles,
  Eye,
  Settings,
  FolderClosed,
  Palette,
  Copy,
  Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import CustomizableQRCode from '@/components/CustomizableQRCode';
import QRDesignModal from '@/components/QRDesignModal';
import MenuLayoutPicker from '@/components/menu/MenuLayoutPicker';
import { getMenuTheme } from '@/components/menu/themeCatalog';

function VegMark() {
  return (
    <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] border-emerald-600 bg-white" aria-hidden>
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
    </span>
  );
}

function NonVegMark() {
  return (
    <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] border-red-600 bg-white" aria-hidden>
      <span className="mb-px h-0 w-0 border-x-[3px] border-b-[5px] border-x-transparent border-b-red-600" />
    </span>
  );
}

interface MenuItem {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  price: number;
  variants?: { label: string; price: number }[] | null;
  image: string | null;
  isAvailable: boolean;
  isVeg: boolean;
  isNonVeg: boolean;
  isVegan: boolean;
  isPopular: boolean;
  order: number;
}

interface MenuCategory {
  id: number;
  name: string;
  order: number;
  items: MenuItem[];
}

interface Restaurant {
  id: number;
  name: string;
  currency: string;
}

interface Menu {
  id: number;
  name: string;
  description: string | null;
  theme: string;
  isDefault: boolean;
  qrCode?: {
    id: number;
    shortCode: string;
    name: string;
    fgColor: string;
    bgColor: string;
    logoUrl?: string | null;
    customDesign?: any | null;
    totalScans: number;
    uniqueScans: number;
  } | null;
}

export default function MenuManagementPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [menusLoading, setMenusLoading] = useState(true);
  
  // Data lists
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [selectedDesignQr, setSelectedDesignQr] = useState<any | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  // Active Category state
  const [activeTabCategoryId, setActiveTabCategoryId] = useState<number | null>(null);
  
  // Category management modals
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  // Item management modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [uploadingItemImage, setUploadingItemImage] = useState(false);
  const [generatingAiImage, setGeneratingAiImage] = useState(false);
  const [savingItem, setSavingItem] = useState(false);
  const [togglingItemId, setTogglingItemId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedMenuId, setCopiedMenuId] = useState(false);

  const handleCopyMenuUrl = (shortCode: string) => {
    const fullUrl = getQrUrl(shortCode);
    navigator.clipboard.writeText(fullUrl);
    setCopiedMenuId(true);
    toast.success('Menu QR scan URL copied!');
    setTimeout(() => setCopiedMenuId(false), 2000);
  };

  const downloadMenuQR = (qr: any, menuName: string) => {
    const svg = document.getElementById(`menu-qr-${qr.shortCode}`);
    if (!svg) return;
    const design = qr.customDesign || {};
    const hasFrame = design.frameId && design.frameId !== 'no_frame';

    try {
      const svgXml = new XMLSerializer().serializeToString(svg);
      const svgBase64 = btoa(unescape(encodeURIComponent(svgXml)));
      
      const img = new Image();
      img.src = `data:image/svg+xml;base64,${svgBase64}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        if (hasFrame) {
          canvas.width = 1050; // Aspect ratio 350:420 -> width 1050, height 1260
          canvas.height = 1260;
        } else {
          canvas.width = 1000;
          canvas.height = 1000;
        }
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = qr.bgColor || '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `menu-qr-${menuName.toLowerCase().replace(/\s+/g, '-')}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          toast.success('QR Code downloaded!');
        }
      };
    } catch (err) {
      console.error(err);
      toast.error('Failed to download QR code');
    }
  };

  // Menu settings modal
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Partial<Menu> | null>(null);
  const [savingMenu, setSavingMenu] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [layoutPickerMode, setLayoutPickerMode] = useState<'live' | 'draft'>('live');

  const fetchMenusList = async (selectId?: number) => {
    setMenusLoading(true);
    try {
      const res = await restaurantService.listMenus();
      if (res.ok) {
        const json = await res.json();
        setMenus(json.menus || []);
        
        if (json.menus?.length > 0) {
          if (selectId && json.menus.some((m: Menu) => m.id === selectId)) {
            setSelectedMenuId(selectId);
          } else {
            const defaultMenu = json.menus.find((m: Menu) => m.isDefault) || json.menus[0];
            setSelectedMenuId(defaultMenu.id);
          }
        } else {
          setSelectedMenuId(null);
        }
      }
    } catch (err) {
      console.error('Failed to load menus list:', err);
    } finally {
      setMenusLoading(false);
    }
  };

  const fetchMenuHierarchy = async () => {
    if (selectedMenuId === null) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await restaurantService.getMenu(selectedMenuId);
      if (res.ok) {
        const json = await res.json();
        if (json.restaurant) setRestaurant(json.restaurant);
        if (json.menu) {
          setCategories(json.menu.categories || []);
          if (json.menu.categories?.length > 0) {
            // Check if active category is in list, if not set first
            const exists = json.menu.categories.some((c: MenuCategory) => c.id === activeTabCategoryId);
            if (!exists) {
              setActiveTabCategoryId(json.menu.categories[0].id);
            }
          } else {
            setActiveTabCategoryId(null);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load menu details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch menus on load
  useEffect(() => {
    if (user) {
      fetchMenusList();
    }
  }, [user]);

  // Fetch hierarchy on selected menu change
  useEffect(() => {
    if (selectedMenuId !== null) {
      fetchMenuHierarchy();
    }
  }, [selectedMenuId]);

  // Menu CRUD Actions
  const handleSaveMenu = async () => {
    if (!editingMenu?.name?.trim()) return;
    setSavingMenu(true);
    try {
      const method = editingMenu.id ? 'PUT' : 'POST';
      const res = await restaurantService.saveMenu(method, editingMenu);
      const json = await res.json();
      if (res.ok) {
        toast.success(`Menu ${editingMenu.id ? 'updated' : 'created'} successfully!`);
        setShowMenuModal(false);
        setEditingMenu(null);
        await fetchMenusList(json.menu?.id);
      } else {
        toast.error(json.error || 'Failed to save menu');
      }
    } catch (e) {
      toast.error('Failed to save menu configuration');
    } finally {
      setSavingMenu(false);
    }
  };

  const handleDeleteMenu = async () => {
    if (!selectedMenuId) return;
    if (menus.length <= 1) {
      toast.error('You cannot delete the only menu. A restaurant must have at least one menu.');
      return;
    }
    if (!confirm('Are you sure you want to delete this entire menu? All categories and dishes inside it will be permanently deleted.')) return;
    
    try {
      const res = await restaurantService.deleteMenu(selectedMenuId!);
      if (res.ok) {
        toast.success('Menu deleted successfully!');
        setSelectedMenuId(null);
        await fetchMenusList();
      } else {
        const json = await res.json();
        toast.error(json.error || 'Failed to delete menu');
      }
    } catch (e) {
      toast.error('Failed to delete menu');
    }
  };

  // Category Actions
  const handleAddCategory = async () => {
    if (!newCatName.trim() || !selectedMenuId) return;
    setSavingCat(true);
    try {
      const res = await restaurantService.createCategory({ name: newCatName, menuId: selectedMenuId });
      if (res.ok) {
        toast.success('Category added successfully!');
        setNewCatName('');
        setShowAddCatModal(false);
        await fetchMenuHierarchy();
      } else {
        throw new Error();
      }
    } catch (e) {
      toast.error('Failed to add category');
    } finally {
      setSavingCat(false);
    }
  };

  const handleEditCategory = async (id: number) => {
    if (!editingCatName.trim()) return;
    setSavingCat(true);
    try {
      const res = await restaurantService.updateCategories({ id, name: editingCatName });
      if (res.ok) {
        toast.success('Category renamed!');
        setEditingCatId(null);
        await fetchMenuHierarchy();
      } else {
        throw new Error();
      }
    } catch (e) {
      toast.error('Failed to update category');
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? All menu items inside it will be deleted!')) return;
    try {
      const res = await restaurantService.deleteCategory(id);
      if (res.ok) {
        toast.success('Category deleted');
        if (activeTabCategoryId === id) {
          const remaining = categories.filter(c => c.id !== id);
          setActiveTabCategoryId(remaining.length > 0 ? remaining[0].id : null);
        }
        await fetchMenuHierarchy();
      }
    } catch (e) {
      toast.error('Failed to delete category');
    }
  };

  const handleReorderCategories = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const list = [...categories];
    const temp = list[index].order;
    list[index].order = list[targetIndex].order;
    list[targetIndex].order = temp;

    try {
      await restaurantService.updateCategories({
        categories: list.map(c => ({ id: c.id, order: c.order }))
      });
      await fetchMenuHierarchy();
    } catch (e) {
      toast.error('Reordering failed');
    }
  };

  const closeItemEditor = () => {
    if (savingItem || uploadingItemImage || generatingAiImage) return;
    setShowItemModal(false);
    setEditingItem(null);
  };

  useEffect(() => {
    if (!showItemModal) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeItemEditor();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showItemModal, savingItem, uploadingItemImage, generatingAiImage]);

  const setItemAvailability = (id: number, isAvailable: boolean) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: (cat.items || []).map((it) => (it.id === id ? { ...it, isAvailable } : it)),
      }))
    );
  };

  // Item Actions — menu_items.is_available
  const handleItemToggle = async (item: MenuItem) => {
    const next = !item.isAvailable;
    setTogglingItemId(item.id);
    setItemAvailability(item.id, next);
    try {
      const res = await restaurantService.updateItems({ id: item.id, isAvailable: next });
      if (!res.ok) {
        const json = await res.json();
        setItemAvailability(item.id, item.isAvailable);
        toast.error(json.error || 'Could not update availability');
        return;
      }
      toast.success(`${item.name} is now ${next ? 'available' : 'not available'}`);
    } catch (e) {
      setItemAvailability(item.id, item.isAvailable);
      toast.error('Could not update availability');
    } finally {
      setTogglingItemId(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingItemImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await uploadService.file(uploadData);
      if (res.ok) {
        const json = await res.json();
        setEditingItem(prev => ({ ...prev, image: json.url }));
        toast.success('Item image uploaded!');
      }
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingItemImage(false);
    }
  };

  const handleGenerateAiImage = async () => {
    let itemName = editingItem?.name?.trim();
    if (!itemName) {
      const promptedName = window.prompt('Please enter the menu item name to generate the image:');
      if (!promptedName || !promptedName.trim()) {
        return;
      }
      itemName = promptedName.trim();
      setEditingItem(prev => (prev ? { ...prev, name: itemName } : null));
    }

    setGeneratingAiImage(true);
    try {
      const res = await restaurantService.generateImage({ itemName });
      const json = await res.json();
      if (res.ok) {
        setEditingItem(prev => (prev ? { ...prev, image: json.url } : null));
        toast.success(`Image generated successfully using ${json.provider}!`);
      } else {
        toast.error(json.error || 'Failed to generate image.');
      }
    } catch (err) {
      toast.error('Error generating AI image.');
    } finally {
      setGeneratingAiImage(false);
    }
  };

  const handleSaveItem = async () => {
    if (!editingItem?.name?.trim() || editingItem.price === undefined) {
      toast.error('Name and price are required.');
      return;
    }

    setSavingItem(true);
    try {
      const method = editingItem.id ? 'PUT' : 'POST';
      const res = await restaurantService.saveItem(method, editingItem);
      if (res.ok) {
        toast.success(`Item ${editingItem.id ? 'updated' : 'added'}!`);
        setShowItemModal(false);
        setEditingItem(null);
        await fetchMenuHierarchy();
      } else {
        throw new Error();
      }
    } catch (e) {
      toast.error('Could not save menu item');
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await restaurantService.deleteItem(id);
      if (res.ok) {
        toast.success('Item deleted');
        await fetchMenuHierarchy();
      }
    } catch (e) {
      toast.error('Failed to delete item');
    }
  };

  const handleReorderItems = async (items: MenuItem[], index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const list = [...items];
    const temp = list[index].order;
    list[index].order = list[targetIndex].order;
    list[targetIndex].order = temp;

    try {
      await restaurantService.updateItems({
        items: list.map(i => ({ id: i.id, order: i.order }))
      });
      await fetchMenuHierarchy();
    } catch (e) {
      toast.error('Failed to reorder items');
    }
  };

  const currentMenu = menus.find(m => m.id === selectedMenuId) || null;
  const currencySymbol = restaurant?.currency === 'USD' ? '$' : restaurant?.currency === 'EUR' ? '€' : '₹';

  const handleApplyLayout = async (themeId: string) => {
    if (layoutPickerMode === 'draft') {
      setEditingMenu((prev) => (prev ? { ...prev, theme: themeId } : prev));
      setShowLayoutPicker(false);
      return;
    }
    if (!currentMenu) return;
    try {
      const res = await restaurantService.saveMenu('PUT', { ...currentMenu, theme: themeId });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to update layout');
      }
      toast.success('Menu layout updated. Scan the QR to see it on a phone.');
      setShowLayoutPicker(false);
      await fetchMenusList(currentMenu.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update layout');
    }
  };

  if (menusLoading && menus.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <Utensils className="w-12 h-12 text-primary/40 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#001B50] mb-2">Setup Restaurant First</h2>
        <p className="text-slate-500 mb-6">You need to set up your Restaurant profile settings before managing categories and dishes.</p>
        <a 
          href="/dashboard/restaurant/profile" 
          className="bg-primary hover:bg-[#00143c] text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-sm"
        >
          Go to Profile Settings
        </a>
      </div>
    );
  }

  const activeCategory = categories.find(c => c.id === activeTabCategoryId) || null;

  return (
    <div className="pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Menu selector and headers row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#001B50] mb-1">Menu Management</h1>
          <p className="text-slate-500 text-sm">Create and organize multiple menus, categories, and dishes.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <div className="col-span-2 flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 sm:col-span-1">
            <FolderClosed className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMenuId || ''}
              onChange={(e) => setSelectedMenuId(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-[#001B50] outline-none cursor-pointer pr-4"
            >
              {menus.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setLayoutPickerMode('live');
              setShowLayoutPicker(true);
            }}
            className="p-2.5 bg-white hover:bg-slate-50 text-[#001B50] rounded-xl transition-colors cursor-pointer border border-slate-200 flex items-center justify-center gap-1.5 text-xs font-bold whitespace-nowrap"
            title="Preview and change guest menu layout"
          >
            <Palette className="w-4 h-4" />
            Change layout
          </button>

          <button
            onClick={() => {
              setEditingMenu(currentMenu ? { ...currentMenu } : null);
              setShowMenuModal(true);
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer border border-slate-250 flex items-center justify-center gap-1.5 text-xs font-bold whitespace-nowrap"
            title="Edit Menu Theme & Details"
          >
            <Settings className="w-4 h-4" />
            Edit Menu Info
          </button>

          <button
            onClick={() => {
              setEditingMenu({
                name: '',
                description: '',
                theme: 'modern',
                isDefault: false
              });
              setShowMenuModal(true);
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-primary rounded-xl transition-colors cursor-pointer border border-slate-250 flex items-center justify-center gap-1.5 text-xs font-bold whitespace-nowrap"
            title="Create New Menu"
          >
            <Plus className="w-4 h-4" />
            New Menu
          </button>

          {menus.length > 1 && (
            <button
              onClick={handleDeleteMenu}
              className="p-2.5 bg-red-50 hover:bg-red-100 text-red-655 rounded-xl transition-colors cursor-pointer border border-red-200 flex items-center justify-center gap-1.5 text-xs font-bold whitespace-nowrap"
              title="Delete Active Menu"
            >
              <Trash2 className="w-4 h-4" />
              Delete Menu
            </button>
          )}

          {currentMenu && (
            <a
              href={currentMenu.isDefault ? `/r/${restaurant?.id}` : `/r/${restaurant?.id}/${currentMenu.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-[#001b50] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer border-none whitespace-nowrap"
            >
              <Eye className="w-4 h-4" />
              Live Preview
            </a>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        /* Categories Sidebar & Dishes Editor Grid */
        <div className="space-y-4 lg:space-y-6">
          {currentMenu && currentMenu.qrCode && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="hidden">
                <CustomizableQRCode
                  id={`menu-qr-${currentMenu.qrCode.shortCode}`}
                  value={getQrUrl(currentMenu.qrCode.shortCode)}
                  fgColor={currentMenu.qrCode.fgColor || '#000000'}
                  bgColor={currentMenu.qrCode.bgColor || '#FFFFFF'}
                  logoUrl={currentMenu.qrCode.logoUrl}
                  logoPreset={currentMenu.qrCode.customDesign?.logoPreset || 'none'}
                  frameId={currentMenu.qrCode.customDesign?.frameId || 'no_frame'}
                  frameText={currentMenu.qrCode.customDesign?.frameText || ''}
                  frameColor={currentMenu.qrCode.customDesign?.frameColor || '#001b50'}
                  frameTextColor={currentMenu.qrCode.customDesign?.frameTextColor || '#ffffff'}
                  size={500}
                />
              </div>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="h-24 w-24 shrink-0 rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-center">
                    <CustomizableQRCode
                      value={getQrUrl(currentMenu.qrCode.shortCode)}
                      fgColor={currentMenu.qrCode.fgColor || '#000000'}
                      bgColor={currentMenu.qrCode.bgColor || '#FFFFFF'}
                      logoUrl={currentMenu.qrCode.logoUrl}
                      logoPreset={currentMenu.qrCode.customDesign?.logoPreset || 'none'}
                      frameId={currentMenu.qrCode.customDesign?.frameId || 'no_frame'}
                      frameText={currentMenu.qrCode.customDesign?.frameText || ''}
                      frameColor={currentMenu.qrCode.customDesign?.frameColor || '#001b50'}
                      frameTextColor={currentMenu.qrCode.customDesign?.frameTextColor || '#ffffff'}
                      size={80}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Menu QR code</p>
                    <p className="mt-1 font-semibold text-[#001B50] truncate">{currentMenu.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {currentMenu.qrCode.totalScans} scans · {currentMenu.qrCode.uniqueScans} unique
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:ml-auto lg:shrink-0">
                  <button
                    onClick={() => setSelectedDesignQr(currentMenu.qrCode)}
                    className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs border-none cursor-pointer whitespace-nowrap"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    Customize
                  </button>
                  <button
                    onClick={() => handleCopyMenuUrl(currentMenu.qrCode!.shortCode)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 cursor-pointer whitespace-nowrap"
                  >
                    {copiedMenuId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy URL
                  </button>
                  <button
                    onClick={() => downloadMenuQR(currentMenu.qrCode!, currentMenu.name)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary hover:bg-[#001b50] text-white font-semibold rounded-xl text-xs border-none cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}

        <div className="grid min-w-0 grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Categories Sidebar */}
          <div className="min-w-0 lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col h-fit lg:sticky lg:top-4 lg:self-start">
            <div className="flex shrink-0 items-center justify-between mb-3 px-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Categories</h3>
              <button 
                onClick={() => {
                  setNewCatName('');
                  setShowAddCatModal(true);
                }}
                className="p-1 text-primary hover:bg-primary/5 rounded-lg"
                title="Add Category"
              >
                <Plus className="w-4.5 h-4.5" />
              </button>
            </div>
            
            {categories.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-350" />
                <p className="text-xs">No categories created yet.</p>
              </div>
            ) : (
              <div className="max-h-80 space-y-1.5 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] lg:max-h-[calc(100dvh-12rem)]">
                {categories.map((cat, index) => {
                  const isSelected = activeTabCategoryId === cat.id;
                  const isEditing = editingCatId === cat.id;
                  return (
                    <div 
                      key={cat.id} 
                      className={`min-w-0 rounded-xl p-2.5 transition-all ${
                        isSelected 
                          ? 'bg-primary/5 text-primary border border-primary/20' 
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="text" 
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            className="min-w-0 flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-sm text-slate-800 focus:outline-none focus:border-primary"
                            autoFocus
                          />
                          <button 
                            type="button"
                            aria-label="Save category"
                            onClick={() => handleEditCategory(cat.id)}
                            disabled={savingCat}
                            className="flex h-8 w-8 shrink-0 items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-lg border-none bg-transparent cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            aria-label="Cancel rename"
                            onClick={() => setEditingCatId(null)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center text-red-500 hover:bg-red-50 rounded-lg border-none bg-transparent cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setActiveTabCategoryId(cat.id)}
                            className="block w-full min-w-0 cursor-pointer border-none bg-transparent p-0 text-left text-sm font-semibold leading-snug break-words"
                          >
                            {cat.name}
                            <span className="ml-1.5 text-[10px] font-normal text-slate-400">({cat.items?.length || 0})</span>
                          </button>

                          <div className="mt-1.5 flex items-center justify-end">
                            <button
                              type="button"
                              aria-label="Move category up"
                              onClick={() => handleReorderCategories(index, 'up')}
                              disabled={index === 0}
                              className="flex h-7 w-7 items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg disabled:opacity-30 cursor-pointer bg-transparent border-none"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              aria-label="Move category down"
                              onClick={() => handleReorderCategories(index, 'down')}
                              disabled={index === categories.length - 1}
                              className="flex h-7 w-7 items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg disabled:opacity-30 cursor-pointer bg-transparent border-none"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button"
                              aria-label="Rename category"
                              onClick={() => {
                                setEditingCatId(cat.id);
                                setEditingCatName(cat.name);
                              }}
                              className="flex h-7 w-7 items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer bg-transparent border-none"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button"
                              aria-label="Delete category"
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="flex h-7 w-7 items-center justify-center text-red-500 hover:bg-red-50 rounded-lg cursor-pointer bg-transparent border-none"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dishes Inventory List */}
          <div className="min-w-0 lg:col-span-3 space-y-6">
            {activeCategory ? (
              <div className="min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 mb-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-[#001B50] break-words">{activeCategory.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{activeCategory.items?.length || 0} items in this category</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingItem({
                        categoryId: activeCategory.id,
                        name: '',
                        description: '',
                        price: 0,
                        variants: null,
                        image: '',
                        isAvailable: true,
                        isVeg: true,
                        isNonVeg: false,
                        isVegan: false,
                        isPopular: false
                      });
                      setShowItemModal(true);
                    }}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 bg-primary/10 hover:bg-primary/15 text-primary font-bold rounded-xl text-sm transition-colors cursor-pointer border-none"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    Add menu item
                  </button>
                </div>

                {/* Items List */}
                {(!activeCategory.items || activeCategory.items.length === 0) ? (
                  <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-355" />
                    <h4 className="font-bold text-slate-705 text-sm">Category is Empty</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Click "Add Menu Item" above to create dishes under this category.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {activeCategory.items.map((item, index) => (
                      <div key={item.id} className={`min-w-0 py-4 first:pt-2 ${item.isAvailable ? '' : 'opacity-90'}`}>
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 ${item.image ? 'cursor-zoom-in' : ''} ${item.isAvailable ? '' : 'grayscale'}`}
                            onClick={() => {
                              if (item.image) setPreviewImage(item.image);
                            }}
                          >
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <Utensils className="w-5 h-5 text-slate-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2">
                              <h4 className={`min-w-0 font-semibold text-sm sm:text-base leading-snug break-words ${item.isAvailable ? 'text-slate-900' : 'text-slate-500'}`}>{item.name}</h4>
                              {!(item.variants && item.variants.length > 0) ? (
                                <span className="whitespace-nowrap text-sm font-semibold text-slate-900">{currencySymbol}{Number(item.price).toFixed(2)}</span>
                              ) : null}
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {item.isVeg && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100"><VegMark /> Veg</span>
                              )}
                              {item.isNonVeg && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-semibold border border-red-100"><NonVegMark /> Non-veg</span>
                              )}
                              {item.isVegan && (
                                <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-semibold border border-green-100">Vegan</span>
                              )}
                              {item.isPopular && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-100 inline-flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" /> Popular
                                </span>
                              )}
                              {!item.isAvailable && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">Not available</span>
                              )}
                            </div>
                            {item.description ? (
                              <p className="text-slate-500 text-xs mt-1.5 line-clamp-2">{item.description}</p>
                            ) : null}
                            {item.variants && item.variants.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {item.variants.map((v, vi) => (
                                  <span key={vi} className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                                    {v.label}: {currencySymbol}{Number(v.price).toFixed(0)}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleItemToggle(item)}
                            disabled={togglingItemId === item.id}
                            aria-pressed={item.isAvailable}
                            className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2 text-xs font-semibold cursor-pointer disabled:opacity-60 ${
                              item.isAvailable
                                ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-white text-slate-600'
                            }`}
                          >
                            <span className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${item.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                              <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all ${item.isAvailable ? 'left-3.5' : 'left-0.5'}`} />
                            </span>
                            {togglingItemId === item.id ? 'Saving…' : item.isAvailable ? 'Available' : 'Not available'}
                          </button>
                          <div className="ml-auto flex shrink-0 items-center">
                            <button
                              type="button"
                              aria-label="Move up"
                              onClick={() => handleReorderItems(activeCategory.items, index, 'up')}
                              disabled={index === 0}
                              className="flex h-8 w-8 items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg disabled:opacity-30 cursor-pointer bg-transparent border-none"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="Move down"
                              onClick={() => handleReorderItems(activeCategory.items, index, 'down')}
                              disabled={index === activeCategory.items.length - 1}
                              className="flex h-8 w-8 items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg disabled:opacity-30 cursor-pointer bg-transparent border-none"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="Edit item"
                              onClick={() => {
                                setEditingItem({ ...item });
                                setShowItemModal(true);
                              }}
                              className="flex h-8 w-8 items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer bg-transparent border-none"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="Delete item"
                              onClick={() => handleDeleteItem(item.id)}
                              className="flex h-8 w-8 items-center justify-center text-red-600 hover:bg-red-50 rounded-lg cursor-pointer bg-transparent border-none"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-bounce" />
                <h3 className="font-bold text-[#001B50] text-lg mb-1">Manage Menu Items</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">Create a menu category on the left to start adding and organizing dishes.</p>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl mx-4 border border-slate-100">
            <h3 className="text-lg font-bold text-[#001B50] mb-4">Add Menu Category</h3>
            <input 
              type="text" 
              placeholder="e.g. Appetizers, Desserts, Beverages"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm mb-4 font-sans focus:outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowAddCatModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCategory}
                disabled={savingCat || !newCatName.trim()}
                className="px-4 py-2 bg-primary hover:bg-[#001b50] rounded-xl text-xs font-semibold text-white disabled:opacity-50 cursor-pointer flex items-center gap-1.5 border-none"
              >
                {savingCat && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Settings Modal */}
      {showMenuModal && editingMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#001B50] mb-6">{editingMenu.id ? 'Edit Menu Details' : 'Create New Menu'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Menu Name</label>
                <input 
                  type="text" 
                  value={editingMenu.name || ''}
                  onChange={(e) => setEditingMenu(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm focus:outline-none"
                  placeholder="e.g. Dinner Menu, Drinks Specials"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Description</label>
                <input 
                  type="text" 
                  value={editingMenu.description || ''}
                  onChange={(e) => setEditingMenu(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm focus:outline-none"
                  placeholder="e.g. Served from 6:00 PM to 10:00 PM"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Guest menu layout</label>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                  <p className="text-xs font-bold text-[#001B50] min-w-0 wrap-anywhere">{getMenuTheme(editingMenu.theme).name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setLayoutPickerMode('draft');
                      setShowLayoutPicker(true);
                    }}
                    className="shrink-0 px-3 py-2 rounded-xl bg-[#001B50] text-white text-[11px] font-bold border-none cursor-pointer"
                  >
                    Change layout
                  </button>
                </div>
              </div>

              {/* Is Default Checkbox */}
              <div className="py-2 border-y border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={editingMenu.isDefault || false}
                    onChange={(e) => setEditingMenu(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="rounded text-primary focus:ring-primary border-slate-300 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-slate-600">Make this the default menu for my restaurant</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
              <button 
                onClick={() => {
                  setShowMenuModal(false);
                  setEditingMenu(null);
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-650 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveMenu}
                disabled={savingMenu || !editingMenu.name?.trim()}
                className="px-5 py-2.5 bg-primary hover:bg-[#001b50] rounded-xl text-xs font-semibold text-white disabled:opacity-50 cursor-pointer flex items-center gap-1.5 border-none"
              >
                {savingMenu && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingMenu.id ? 'Save Menu Details' : 'Create Menu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit menu item sidebar */}
      {showItemModal && editingItem && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-labelledby="item-editor-title">
          <button
            type="button"
            aria-label="Close menu item editor"
            className="absolute inset-0 cursor-pointer border-none bg-[#1C1410]/40"
            onClick={closeItemEditor}
          />
          <aside className="absolute inset-y-0 right-0 flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl">
            <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 sm:px-5">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {activeCategory?.name || 'Menu'}
                </p>
                <h2 id="item-editor-title" className="truncate text-base font-bold text-[#001B50] sm:text-lg">
                  {editingItem.id ? 'Edit menu item' : 'Add menu item'}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={closeItemEditor}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
              <div className="space-y-6">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Dish name</label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Butter Chicken"
                  />
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">Availability</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingItem(prev => ({ ...prev, isAvailable: true }))}
                      className={`inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-semibold ${
                        editingItem.isAvailable !== false
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem(prev => ({ ...prev, isAvailable: false }))}
                      className={`inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-semibold ${
                        editingItem.isAvailable === false
                          ? 'border-slate-800 bg-slate-800 text-white'
                          : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      Not available
                    </button>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {editingItem.isAvailable === false
                      ? 'Guests will not see this dish until you mark it available again.'
                      : 'Guests can see this dish on the menu.'}
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Base price ({currencySymbol})</label>
                  <input
                    type="number"
                    value={editingItem.price === 0 ? '' : editingItem.price}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, price: e.target.value === '' ? 0 : Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">Used when this dish has no size or portion prices.</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-700">Size / portion</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">Optional. Example: Quarter {currencySymbol}80, Half {currencySymbol}150, Full {currencySymbol}250.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const current = editingItem.variants || [];
                        setEditingItem(prev => ({
                          ...prev,
                          variants: [...current, { label: '', price: 0 }]
                        }));
                      }}
                      className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-primary"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add size
                    </button>
                  </div>

                  {editingItem.variants && editingItem.variants.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {editingItem.variants.map((variant, vi) => (
                        <div key={vi} className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={variant.label}
                              onChange={(e) => {
                                const updated = [...(editingItem.variants || [])];
                                updated[vi] = { ...updated[vi], label: e.target.value };
                                setEditingItem(prev => ({ ...prev, variants: updated }));
                              }}
                              placeholder="Size name, e.g. Half"
                              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-primary"
                            />
                            <button
                              type="button"
                              aria-label="Remove size"
                              onClick={() => {
                                const updated = (editingItem.variants || []).filter((_, i) => i !== vi);
                                setEditingItem(prev => ({ ...prev, variants: updated.length > 0 ? updated : null }));
                              }}
                              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-red-500 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <span className="text-sm text-slate-400">{currencySymbol}</span>
                            <input
                              type="number"
                              value={variant.price === 0 ? '' : variant.price}
                              onChange={(e) => {
                                const updated = [...(editingItem.variants || [])];
                                updated[vi] = { ...updated[vi], price: e.target.value === '' ? 0 : Number(e.target.value) };
                                setEditingItem(prev => ({ ...prev, variants: updated }));
                              }}
                              placeholder="Price"
                              min="0"
                              step="0.01"
                              className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-center text-xs text-slate-400">No sizes yet. Add one if this dish has more than one price.</p>
                  )}
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">Dietary type</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingItem(prev => ({ ...prev, isVeg: true, isNonVeg: false }))}
                      className={`inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold ${
                        editingItem.isVeg
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      <VegMark />
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem(prev => ({ ...prev, isVeg: false, isNonVeg: true }))}
                      className={`inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold ${
                        editingItem.isNonVeg
                          ? 'border-red-500 bg-red-50 text-red-600'
                          : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      <NonVegMark />
                      Non-veg
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                      <input
                        type="checkbox"
                        checked={editingItem.isVegan || false}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, isVegan: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-primary"
                      />
                      <span className="text-sm font-semibold text-slate-700">Vegan</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                      <input
                        type="checkbox"
                        checked={editingItem.isPopular || false}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, isPopular: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-primary"
                      />
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
                        <Sparkles className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        Popular
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Description</label>
                  <textarea
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Ingredients, preparation style, spice level"
                  />
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">Dish photo</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="relative h-24 w-24 shrink-0">
                      <button
                        type="button"
                        className={`flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 ${editingItem.image ? 'cursor-zoom-in' : 'cursor-default'}`}
                        onClick={() => {
                          if (editingItem.image) setPreviewImage(editingItem.image);
                        }}
                      >
                        {editingItem.image ? (
                          <img src={editingItem.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-slate-300" />
                        )}
                      </button>
                      {editingItem.image ? (
                        <button
                          type="button"
                          aria-label="Remove photo"
                          onClick={() => setEditingItem(prev => ({ ...prev, image: null }))}
                          className="absolute -right-1.5 -top-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-none bg-slate-900 text-white shadow-sm"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        id="item-img-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploadingItemImage || generatingAiImage}
                      />
                      <div className="grid grid-cols-1 gap-2">
                        <label
                          htmlFor="item-img-upload"
                          className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 ${(uploadingItemImage || generatingAiImage) ? 'pointer-events-none opacity-50' : ''}`}
                        >
                          {uploadingItemImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                          Upload photo
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateAiImage}
                          disabled={uploadingItemImage || generatingAiImage}
                          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary disabled:opacity-50"
                        >
                          {generatingAiImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                          {generatingAiImage ? 'Generating…' : 'Generate with AI'}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">Square photo works best. Maximum 1MB.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="shrink-0 border-t border-slate-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={closeItemEditor}
                  disabled={savingItem || uploadingItemImage || generatingAiImage}
                  className="h-11 cursor-pointer rounded-xl border-none bg-slate-100 text-sm font-semibold text-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveItem}
                  disabled={savingItem || uploadingItemImage || generatingAiImage}
                  className="inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none bg-primary text-sm font-semibold text-white disabled:opacity-50"
                >
                  {savingItem && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingItem.id ? 'Save changes' : 'Save dish'}
                </button>
              </div>
            </footer>
          </aside>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-slate-200 bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all border-none cursor-pointer animate-fade-in"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="bg-white rounded-2xl p-2 shadow-2xl overflow-hidden max-w-full max-h-full flex items-center justify-center scale-95 animate-scale-up">
              <img 
                src={previewImage} 
                alt="Big Preview" 
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
      <MenuLayoutPicker
        open={showLayoutPicker}
        value={
          layoutPickerMode === 'draft'
            ? editingMenu?.theme || currentMenu?.theme || 'modern'
            : currentMenu?.theme || 'modern'
        }
        onClose={() => setShowLayoutPicker(false)}
        onApply={handleApplyLayout}
      />

      {/* Universal QR Customization Modal */}
      {selectedDesignQr && (
        <QRDesignModal
          isOpen={!!selectedDesignQr}
          onClose={() => setSelectedDesignQr(null)}
          qrCode={selectedDesignQr}
          onSave={(updatedQr) => {
            setMenus((prev) =>
              prev.map((m) => {
                if (m.qrCode && m.qrCode.id === updatedQr.id) {
                  return {
                    ...m,
                    qrCode: {
                      ...m.qrCode,
                      ...updatedQr,
                    },
                  };
                }
                return m;
              })
            );
          }}
        />
      )}
    </div>
  );
}
