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
import { toast } from '@/lib/toast';
import CustomizableQRCode from '@/components/CustomizableQRCode';
import QRDesignModal from '@/components/QRDesignModal';
import MenuLayoutPicker from '@/components/menu/MenuLayoutPicker';
import { getMenuTheme } from '@/components/menu/themeCatalog';
import { ItemTags } from '@/components/menu/ItemTags';
import {
  MENU_TAG_PRESETS,
  MAX_ITEM_TAGS,
  MAX_TAG_LENGTH,
  isPopularFromTags,
  normalizeTag,
  tagsForItem,
  withTags,
} from '@/lib/menu/item-config';

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
  config?: { tags?: string[] } | null;
  tags?: string[];
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
  const [customTagDraft, setCustomTagDraft] = useState('');

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

  const applyMenuHierarchy = (json: {
    restaurant?: Restaurant | null;
    menu?: (Menu & { categories?: MenuCategory[] }) | null;
  }) => {
    if (json.restaurant) setRestaurant(json.restaurant);
    if (json.menu) {
      const nextCategories = json.menu.categories || [];
      setCategories(nextCategories);
      if (nextCategories.length > 0) {
        const exists = nextCategories.some((c) => c.id === activeTabCategoryId);
        if (!exists) {
          setActiveTabCategoryId(nextCategories[0].id);
        }
      } else {
        setActiveTabCategoryId(null);
      }
    }
  };

  const fetchMenuHierarchy = async (menuId?: number | null) => {
    const id = menuId ?? selectedMenuId;
    if (id === null || id === undefined) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await restaurantService.getMenu(id);
      if (res.ok) {
        const json = res.data?.menu ? res.data : await res.json();
        applyMenuHierarchy(json);
      }
    } catch (err) {
      console.error('Failed to load menu details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenusList = async (selectId?: number) => {
    setMenusLoading(true);
    setLoading(true);
    try {
      const res = await restaurantService.listMenus();
      if (res.ok) {
        const json = res.data?.menus ? res.data : await res.json();
        const list: Menu[] = json.menus || [];
        setMenus(list);

        if (list.length > 0) {
          const nextId =
            selectId && list.some((m) => m.id === selectId)
              ? selectId
              : (list.find((m) => m.isDefault) || list[0]).id;
          setSelectedMenuId(nextId);
          // Prefetch hierarchy in the same turn (avoids list → detail waterfall).
          await fetchMenuHierarchy(nextId);
        } else {
          setSelectedMenuId(null);
          setCategories([]);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to load menus list:', err);
      setLoading(false);
    } finally {
      setMenusLoading(false);
    }
  };

  // Fetch menus on load
  useEffect(() => {
    if (user) {
      void fetchMenusList();
    }
  }, [user]);

  // Fetch hierarchy when user switches menu (initial load already prefetched).
  const initialMenuLoad = React.useRef(true);
  useEffect(() => {
    if (selectedMenuId === null) return;
    if (initialMenuLoad.current) {
      initialMenuLoad.current = false;
      return;
    }
    void fetchMenuHierarchy(selectedMenuId);
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
        toast.error(json.message || json.error || 'Failed to save menu');
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
        toast.error(json.message || json.error || 'Failed to delete menu');
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
        toast.error(json.message || json.error || 'Could not update availability');
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
        toast.error(json.message || json.error || 'Failed to generate image.');
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
      const tags = tagsForItem({
        isPopular: editingItem.isPopular,
        config: withTags(editingItem.config, editingItem.tags || tagsForItem(editingItem)),
      });
      const payload = {
        ...editingItem,
        tags,
        config: withTags(editingItem.config, tags),
        isPopular: isPopularFromTags(tags),
      };
      const res = await restaurantService.saveItem(method, payload);
      if (res.ok) {
        toast.success(`Item ${editingItem.id ? 'updated' : 'added'}!`);
        setShowItemModal(false);
        setEditingItem(null);
        setCustomTagDraft('');
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

  const editingTags = editingItem ? (editingItem.tags || tagsForItem(editingItem)) : [];

  const setEditingTags = (tags: string[]) => {
    setEditingItem((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tags,
        config: withTags(prev.config, tags),
        isPopular: isPopularFromTags(tags),
      };
    });
  };

  const toggleEditingTag = (tag: string) => {
    const next = editingTags.includes(tag)
      ? editingTags.filter((entry) => entry !== tag)
      : editingTags.length >= MAX_ITEM_TAGS
        ? editingTags
        : [...editingTags, tag];
    setEditingTags(next);
  };

  const addCustomEditingTag = () => {
    const tag = normalizeTag(customTagDraft);
    if (!tag) return;
    if (editingTags.some((entry) => entry.toLowerCase() === tag.toLowerCase())) {
      setCustomTagDraft('');
      return;
    }
    if (editingTags.length >= MAX_ITEM_TAGS) {
      toast.error(`You can add up to ${MAX_ITEM_TAGS} tags.`);
      return;
    }
    setEditingTags([...editingTags, tag]);
    setCustomTagDraft('');
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
        throw new Error(json.message || json.error || 'Failed to update layout');
      }
      toast.success('Menu layout updated. Scan the QR to see it on a phone.');
      setShowLayoutPicker(false);
      await fetchMenusList(currentMenu.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update layout');
    }
  };

  const fieldClass =
    'w-full min-w-0 rounded-xl border border-[#E7DDD2] bg-[#FBF8F4] px-3.5 py-2.5 text-sm text-[#1C1410] outline-none transition focus:border-[#C4622D] focus:ring-2 focus:ring-[#C4622D]/15';
  const iconBtn =
    'inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-[#8A7568] transition hover:bg-[#F6F1EA] hover:text-[#1C1410] disabled:cursor-not-allowed disabled:opacity-30';

  if (menusLoading && menus.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4622D]" />
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-[#E7DDD2] bg-white px-6 py-12 text-center shadow-[0_1px_0_rgba(28,20,16,0.04)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF4EC]">
          <Utensils className="h-7 w-7 text-[#C4622D]" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-[#1C1410]">Set up restaurant first</h2>
        <p className="mt-2 text-sm text-[#6B5A50]">
          Create your restaurant profile before managing menus, categories, and dishes.
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

  const activeCategory = categories.find(c => c.id === activeTabCategoryId) || null;
  const totalDishes = categories.reduce((acc, cat) => acc + (cat.items?.length || 0), 0);
  const availableDishes = categories.reduce(
    (acc, cat) => acc + (cat.items?.filter((item) => item.isAvailable).length || 0),
    0,
  );
  const menuScans = currentMenu?.qrCode?.totalScans ?? 0;

  return (
    <div className="mx-auto max-w-6xl animate-fade-in overflow-x-clip pb-28 md:pb-12">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C4622D]">Kitchen catalog</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1C1410] sm:text-3xl">Menu Management</h1>
          <p className="mt-1 max-w-xl text-sm text-[#6B5A50]">
            Build menus, organize categories, and polish dishes guests see when they scan.
          </p>
        </div>
        {currentMenu ? (
          <a
            href={currentMenu.isDefault ? `/r/${restaurant?.id}` : `/r/${restaurant?.id}/${currentMenu.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border-none bg-[#1C1410] px-4 text-sm font-semibold text-white no-underline hover:bg-[#2A211C] sm:w-auto"
          >
            <Eye className="h-4 w-4" />
            Live preview
          </a>
        ) : null}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="min-w-0 rounded-2xl border border-[#E7DDD2] bg-white px-4 py-3 shadow-[0_1px_0_rgba(28,20,16,0.04)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A7568]">Categories</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-[#1C1410]">{categories.length}</p>
        </div>
        <div className="min-w-0 rounded-2xl border border-[#E7DDD2] bg-white px-4 py-3 shadow-[0_1px_0_rgba(28,20,16,0.04)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A7568]">Dishes</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-[#1C1410]">{totalDishes}</p>
          <p className="mt-0.5 truncate text-xs text-[#6B5A50]">{availableDishes} available</p>
        </div>
        <div className="min-w-0 rounded-2xl border border-[#E7DDD2] bg-white px-4 py-3 shadow-[0_1px_0_rgba(28,20,16,0.04)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A7568]">Menus</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-[#1C1410]">{menus.length}</p>
        </div>
        <div className="min-w-0 rounded-2xl border border-[#E7DDD2] bg-white px-4 py-3 shadow-[0_1px_0_rgba(28,20,16,0.04)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A7568]">QR scans</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-[#1C1410]">{menuScans}</p>
          <p className="mt-0.5 truncate text-xs text-[#6B5A50]">
            {currentMenu?.qrCode ? `${currentMenu.qrCode.uniqueScans} unique` : 'No QR yet'}
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-3xl border border-[#E7DDD2] bg-white p-3 shadow-[0_1px_0_rgba(28,20,16,0.04)] sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#E7DDD2] bg-[#FBF8F4] px-3 py-2.5">
            <FolderClosed className="h-4 w-4 shrink-0 text-[#8A7568]" />
            <select
              value={selectedMenuId || ''}
              onChange={(e) => setSelectedMenuId(Number(e.target.value))}
              className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm font-semibold text-[#1C1410] outline-none"
            >
              {menus.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={() => {
                setLayoutPickerMode('live');
                setShowLayoutPicker(true);
              }}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#E7DDD2] bg-white px-3 text-xs font-semibold text-[#1C1410]"
              title="Preview and change guest menu layout"
            >
              <Palette className="h-3.5 w-3.5 text-[#C4622D]" />
              Layout
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingMenu(currentMenu ? { ...currentMenu } : null);
                setShowMenuModal(true);
              }}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#E7DDD2] bg-white px-3 text-xs font-semibold text-[#1C1410]"
              title="Edit menu theme & details"
            >
              <Settings className="h-3.5 w-3.5 text-[#8A7568]" />
              Menu info
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingMenu({
                  name: '',
                  description: '',
                  theme: 'modern',
                  isDefault: false,
                });
                setShowMenuModal(true);
              }}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none bg-[#FFF4EC] px-3 text-xs font-semibold text-[#C4622D]"
              title="Create new menu"
            >
              <Plus className="h-3.5 w-3.5" />
              New menu
            </button>
            {menus.length > 1 ? (
              <button
                type="button"
                onClick={handleDeleteMenu}
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600"
                title="Delete active menu"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-[#E7DDD2] bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#C4622D]" />
        </div>
      ) : (
        <div className="space-y-5">
          {currentMenu?.qrCode ? (
            <div className="rounded-3xl border border-[#E7DDD2] bg-white p-4 shadow-[0_1px_0_rgba(28,20,16,0.04)] sm:p-5">
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
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-[#E7DDD2] bg-[#FBF8F4] p-2">
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
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A7568]">Menu QR code</p>
                    <p className="mt-1 truncate font-semibold text-[#1C1410]">{currentMenu.name}</p>
                    <p className="mt-1 text-xs text-[#6B5A50]">
                      {currentMenu.qrCode.totalScans} scans · {currentMenu.qrCode.uniqueScans} unique
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:ml-auto lg:shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedDesignQr(currentMenu.qrCode)}
                    className="col-span-2 inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border-none bg-[#1C1410] px-3 py-2.5 text-xs font-semibold text-white sm:col-span-1"
                  >
                    <Palette className="h-3.5 w-3.5" />
                    Customize
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyMenuUrl(currentMenu.qrCode!.shortCode)}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[#E7DDD2] bg-white px-3 py-2.5 text-xs font-semibold text-[#1C1410]"
                  >
                    {copiedMenuId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy URL
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadMenuQR(currentMenu.qrCode!, currentMenu.name)}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border-none bg-[#C4622D] px-3 py-2.5 text-xs font-semibold text-white"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Categories — chips on mobile, sticky sidebar on desktop */}
            <div className="h-fit min-w-0 rounded-3xl border border-[#E7DDD2] bg-white p-4 shadow-[0_1px_0_rgba(28,20,16,0.04)] lg:sticky lg:top-4 lg:col-span-3 lg:max-h-[calc(100dvh-2rem)] lg:self-start lg:overflow-y-auto">
              <div className="mb-3 flex shrink-0 items-center justify-between px-1">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A7568]">Categories</h3>
                <button
                  type="button"
                  onClick={() => {
                    setNewCatName('');
                    setShowAddCatModal(true);
                  }}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#E7DDD2] bg-[#FBF8F4] text-[#C4622D]"
                  title="Add category"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {categories.length === 0 ? (
                <div className="py-8 text-center text-[#8A7568]">
                  <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-[#D4C4B5]" />
                  <p className="text-xs">No categories yet.</p>
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] lg:max-h-[calc(100dvh-8rem)] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0">
                  {categories.map((cat, index) => {
                    const isSelected = activeTabCategoryId === cat.id;
                    const isEditing = editingCatId === cat.id;
                    return (
                      <div
                        key={cat.id}
                        className={`min-w-[168px] shrink-0 rounded-2xl border p-2.5 transition lg:min-w-0 ${
                          isSelected
                            ? 'border-[#C4622D]/30 bg-[#FFF4EC]'
                            : 'border-transparent bg-[#FBF8F4] hover:border-[#E7DDD2]'
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editingCatName}
                              onChange={(e) => setEditingCatName(e.target.value)}
                              className="min-w-0 flex-1 rounded-lg border border-[#E7DDD2] bg-white px-2 py-1 text-sm outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              aria-label="Save category"
                              onClick={() => handleEditCategory(cat.id)}
                              disabled={savingCat}
                              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-emerald-600"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="Cancel rename"
                              onClick={() => setEditingCatId(null)}
                              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setActiveTabCategoryId(cat.id)}
                              className="block w-full min-w-0 cursor-pointer break-words border-none bg-transparent p-0 text-left text-sm font-semibold leading-snug text-[#1C1410]"
                            >
                              {cat.name}
                              <span className="ml-1.5 text-[10px] font-normal text-[#8A7568]">
                                ({cat.items?.length || 0})
                              </span>
                            </button>
                            <div className="mt-1.5 flex items-center justify-end">
                              <button type="button" aria-label="Move category up" onClick={() => handleReorderCategories(index, 'up')} disabled={index === 0} className={iconBtn}>
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button type="button" aria-label="Move category down" onClick={() => handleReorderCategories(index, 'down')} disabled={index === categories.length - 1} className={iconBtn}>
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label="Rename category"
                                onClick={() => {
                                  setEditingCatId(cat.id);
                                  setEditingCatName(cat.name);
                                }}
                                className={`${iconBtn} hover:text-[#C4622D]`}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button type="button" aria-label="Delete category" onClick={() => handleDeleteCategory(cat.id)} className={`${iconBtn} hover:text-red-500`}>
                                <Trash2 className="h-3.5 w-3.5" />
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

            <div className="min-w-0 space-y-5 lg:col-span-9">
              {activeCategory ? (
                <div className="min-w-0 rounded-3xl border border-[#E7DDD2] bg-white p-4 shadow-[0_1px_0_rgba(28,20,16,0.04)] sm:p-6">
                  <div className="mb-4 flex flex-col gap-3 border-b border-[#F0E8DF] pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="break-words text-lg font-semibold text-[#1C1410] sm:text-xl">{activeCategory.name}</h2>
                      <p className="mt-0.5 text-xs text-[#6B5A50]">
                        {activeCategory.items?.length || 0} {(activeCategory.items?.length || 0) === 1 ? 'dish' : 'dishes'} in this category
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem({
                          categoryId: activeCategory.id,
                          name: '',
                          description: '',
                          price: 0,
                          variants: null,
                          config: null,
                          tags: [],
                          image: '',
                          isAvailable: true,
                          isVeg: true,
                          isNonVeg: false,
                          isVegan: false,
                          isPopular: false,
                        });
                        setCustomTagDraft('');
                        setShowItemModal(true);
                      }}
                      className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border-none bg-[#1C1410] px-4 text-sm font-semibold text-white sm:w-auto"
                    >
                      <Plus className="h-4 w-4 shrink-0" />
                      Add dish
                    </button>
                  </div>

                  {!activeCategory.items || activeCategory.items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#E7DDD2] py-14 text-center">
                      <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-[#D4C4B5]" />
                      <h4 className="text-sm font-semibold text-[#1C1410]">Category is empty</h4>
                      <p className="mx-auto mt-1 max-w-xs text-xs text-[#6B5A50]">
                        Add your first dish to this category.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeCategory.items.map((item, index) => (
                        <div
                          key={item.id}
                          className={`min-w-0 rounded-2xl border border-[#E7DDD2] bg-[#FBF8F4] p-3.5 sm:p-4 ${
                            item.isAvailable ? '' : 'opacity-90'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E7DDD2] bg-white sm:h-16 sm:w-16 ${
                                item.image ? 'cursor-zoom-in' : ''
                              } ${item.isAvailable ? '' : 'grayscale'}`}
                              onClick={() => {
                                if (item.image) setPreviewImage(item.image);
                              }}
                            >
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                              ) : (
                                <Utensils className="h-5 w-5 text-[#D4C4B5]" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2">
                                <h4
                                  className={`min-w-0 break-words text-sm font-semibold leading-snug sm:text-base ${
                                    item.isAvailable ? 'text-[#1C1410]' : 'text-[#8A7568]'
                                  }`}
                                >
                                  {item.name}
                                </h4>
                                {!(item.variants && item.variants.length > 0) ? (
                                  <span className="whitespace-nowrap text-sm font-semibold text-[#1C1410]">
                                    {currencySymbol}
                                    {Number(item.price).toFixed(2)}
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {item.isVeg ? (
                                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                    <VegMark /> Veg
                                  </span>
                                ) : null}
                                {item.isNonVeg ? (
                                  <span className="inline-flex items-center gap-1 rounded-md border border-red-100 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                                    <NonVegMark /> Non-veg
                                  </span>
                                ) : null}
                                {item.isVegan ? (
                                  <span className="rounded-md border border-green-100 bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                                    Vegan
                                  </span>
                                ) : null}
                                <ItemTags item={item} />
                                {!item.isAvailable ? (
                                  <span className="rounded-md border border-[#E7DDD2] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#6B5A50]">
                                    Not available
                                  </span>
                                ) : null}
                              </div>
                              {item.description ? (
                                <p className="mt-1.5 line-clamp-2 text-xs text-[#6B5A50]">{item.description}</p>
                              ) : null}
                              {item.variants && item.variants.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {item.variants.map((v, vi) => (
                                    <span
                                      key={vi}
                                      className="rounded-lg border border-[#E7DDD2] bg-white px-2 py-0.5 text-xs font-semibold text-[#1C1410]"
                                    >
                                      {v.label}: {currencySymbol}
                                      {Number(v.price).toFixed(0)}
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
                              className={`inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2 text-xs font-semibold disabled:opacity-60 ${
                                item.isAvailable
                                  ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                                  : 'border-[#E7DDD2] bg-white text-[#6B5A50]'
                              }`}
                            >
                              <span
                                className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${
                                  item.isAvailable ? 'bg-emerald-500' : 'bg-[#D4C4B5]'
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all ${
                                    item.isAvailable ? 'left-3.5' : 'left-0.5'
                                  }`}
                                />
                              </span>
                              {togglingItemId === item.id ? 'Saving…' : item.isAvailable ? 'Available' : 'Unavailable'}
                            </button>
                            <div className="ml-auto flex shrink-0 items-center">
                              <button type="button" aria-label="Move up" onClick={() => handleReorderItems(activeCategory.items, index, 'up')} disabled={index === 0} className={iconBtn}>
                                <ArrowUp className="h-4 w-4" />
                              </button>
                              <button type="button" aria-label="Move down" onClick={() => handleReorderItems(activeCategory.items, index, 'down')} disabled={index === activeCategory.items.length - 1} className={iconBtn}>
                                <ArrowDown className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                aria-label="Edit item"
                                onClick={() => {
                                  setEditingItem({ ...item, tags: tagsForItem(item) });
                                  setCustomTagDraft('');
                                  setShowItemModal(true);
                                }}
                                className={`${iconBtn} hover:text-[#C4622D]`}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button type="button" aria-label="Delete item" onClick={() => handleDeleteItem(item.id)} className={`${iconBtn} hover:text-red-500`}>
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-[#E7DDD2] bg-white px-6 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF4EC]">
                    <Utensils className="h-7 w-7 text-[#C4622D]" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#1C1410]">Start with a category</h3>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-[#6B5A50]">
                    Add a category, then create dishes guests will see on the live menu.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCatName('');
                      setShowAddCatModal(true);
                    }}
                    className="mt-5 inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border-none bg-[#C4622D] px-4 text-sm font-semibold text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add category
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile sticky add dish */}
          {activeCategory ? (
            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 p-4 md:hidden">
              <button
                type="button"
                onClick={() => {
                  setEditingItem({
                    categoryId: activeCategory.id,
                    name: '',
                    description: '',
                    price: 0,
                    variants: null,
                    config: null,
                    tags: [],
                    image: '',
                    isAvailable: true,
                    isVeg: true,
                    isNonVeg: false,
                    isVegan: false,
                    isPopular: false,
                  });
                  setCustomTagDraft('');
                  setShowItemModal(true);
                }}
                className="pointer-events-auto flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-none bg-[#C4622D] text-sm font-semibold text-white shadow-[0_12px_40px_rgba(196,98,45,0.35)]"
              >
                <Plus className="h-4 w-4" />
                Add dish
              </button>
            </div>
          ) : null}
        </div>
      )}

      {showAddCatModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1410]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#E7DDD2] bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#1C1410]">Add category</h3>
            <p className="mt-1 text-sm text-[#6B5A50]">Group dishes the way guests browse your menu.</p>
            <input
              type="text"
              placeholder="e.g. Appetizers, Desserts, Beverages"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className={`${fieldClass} mt-4`}
              autoFocus
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddCatModal(false)}
                className="h-10 cursor-pointer rounded-xl border border-[#E7DDD2] bg-white px-4 text-xs font-semibold text-[#1C1410]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={savingCat || !newCatName.trim()}
                className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border-none bg-[#C4622D] px-4 text-xs font-semibold text-white disabled:opacity-50"
              >
                {savingCat ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Add category
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showMenuModal && editingMenu ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1410]/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#E7DDD2] bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#1C1410]">
              {editingMenu.id ? 'Edit menu details' : 'Create new menu'}
            </h3>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Menu name</label>
                <input
                  type="text"
                  value={editingMenu.name || ''}
                  onChange={(e) => setEditingMenu((prev) => ({ ...prev, name: e.target.value }))}
                  className={fieldClass}
                  placeholder="e.g. Dinner Menu, Drinks Specials"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Description</label>
                <input
                  type="text"
                  value={editingMenu.description || ''}
                  onChange={(e) => setEditingMenu((prev) => ({ ...prev, description: e.target.value }))}
                  className={fieldClass}
                  placeholder="e.g. Served from 6:00 PM to 10:00 PM"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Guest menu layout</label>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E7DDD2] bg-[#FBF8F4] px-3 py-2.5">
                  <p className="min-w-0 text-xs font-semibold text-[#1C1410] wrap-anywhere">
                    {getMenuTheme(editingMenu.theme).name}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setLayoutPickerMode('draft');
                      setShowLayoutPicker(true);
                    }}
                    className="shrink-0 cursor-pointer rounded-xl border-none bg-[#1C1410] px-3 py-2 text-[11px] font-semibold text-white"
                  >
                    Change layout
                  </button>
                </div>
              </div>
              <label className="flex cursor-pointer select-none items-center gap-2 border-y border-[#F0E8DF] py-3">
                <input
                  type="checkbox"
                  checked={editingMenu.isDefault || false}
                  onChange={(e) => setEditingMenu((prev) => ({ ...prev, isDefault: e.target.checked }))}
                  className="h-4 w-4 rounded border-[#E7DDD2] text-[#C4622D]"
                />
                <span className="text-xs font-semibold text-[#6B5A50]">Make this the default menu</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-[#F0E8DF] pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowMenuModal(false);
                  setEditingMenu(null);
                }}
                className="h-10 cursor-pointer rounded-xl border border-[#E7DDD2] bg-white px-4 text-xs font-semibold text-[#1C1410]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMenu}
                disabled={savingMenu || !editingMenu.name?.trim()}
                className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border-none bg-[#C4622D] px-4 text-xs font-semibold text-white disabled:opacity-50"
              >
                {savingMenu ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {editingMenu.id ? 'Save details' : 'Create menu'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
            <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#E7DDD2] px-4 sm:px-5">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A7568]">
                  {activeCategory?.name || 'Menu'}
                </p>
                <h2 id="item-editor-title" className="truncate text-base font-semibold text-[#1C1410] sm:text-lg">
                  {editingItem.id ? 'Edit dish' : 'Add dish'}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={closeItemEditor}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-[#F6F1EA] text-[#6B5A50] hover:bg-[#E7DDD2]"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
              <div className="space-y-6">
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Dish name</label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                    className={fieldClass}
                    placeholder="e.g. Butter Chicken"
                  />
                </div>

                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Availability</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingItem(prev => ({ ...prev, isAvailable: true }))}
                      className={`inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-semibold ${
                        editingItem.isAvailable !== false
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-[#E7DDD2] bg-white text-[#8A7568]'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem(prev => ({ ...prev, isAvailable: false }))}
                      className={`inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-semibold ${
                        editingItem.isAvailable === false
                          ? 'border-[#1C1410] bg-[#1C1410] text-white'
                          : 'border-[#E7DDD2] bg-white text-[#8A7568]'
                      }`}
                    >
                      Unavailable
                    </button>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#6B5A50]">
                    {editingItem.isAvailable === false
                      ? 'Guests will not see this dish until you mark it available again.'
                      : 'Guests can see this dish on the menu.'}
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Base price ({currencySymbol})</label>
                  <input
                    type="number"
                    value={editingItem.price === 0 ? '' : editingItem.price}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, price: e.target.value === '' ? 0 : Number(e.target.value) }))}
                    className={fieldClass}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <p className="mt-1.5 text-xs text-[#6B5A50]">Used when this dish has no size or portion prices.</p>
                </div>

                <div className="rounded-2xl border border-[#E7DDD2] bg-[#FBF8F4] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Size / portion</p>
                      <p className="mt-1 text-xs leading-relaxed text-[#6B5A50]">Optional. Example: Quarter {currencySymbol}80, Half {currencySymbol}150, Full {currencySymbol}250.</p>
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
                      className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 self-start rounded-xl border border-[#E7DDD2] bg-white px-3 py-2 text-xs font-bold text-[#C4622D]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add size
                    </button>
                  </div>

                  {editingItem.variants && editingItem.variants.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {editingItem.variants.map((variant, vi) => (
                        <div key={vi} className="rounded-xl border border-[#E7DDD2] bg-white p-3">
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
                              className="min-w-0 flex-1 rounded-lg border border-[#E7DDD2] bg-[#FBF8F4] px-3 py-2 text-sm outline-none focus:border-[#C4622D]"
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
                          <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#E7DDD2] bg-[#FBF8F4] px-3 py-2">
                            <span className="text-sm text-[#8A7568]">{currencySymbol}</span>
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
                              className="w-full bg-transparent text-sm font-semibold text-[#1C1410] outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-center text-xs text-[#A89484]">No sizes yet. Add one if this dish has more than one price.</p>
                  )}
                </div>

                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Dietary type</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingItem(prev => ({ ...prev, isVeg: true, isNonVeg: false }))}
                      className={`inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold ${
                        editingItem.isVeg
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-[#E7DDD2] bg-white text-[#8A7568]'
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
                          : 'border-[#E7DDD2] bg-white text-[#8A7568]'
                      }`}
                    >
                      <NonVegMark />
                      Non-veg
                    </button>
                  </div>
                  <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-[#E7DDD2] bg-white px-3 py-3">
                    <input
                      type="checkbox"
                      checked={editingItem.isVegan || false}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, isVegan: e.target.checked }))}
                      className="h-4 w-4 rounded border-[#E7DDD2] text-[#C4622D]"
                    />
                    <span className="text-sm font-semibold text-[#1C1410]">Vegan</span>
                  </label>
                </div>

                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Tags</p>
                  <p className="mb-3 text-xs leading-5 text-[#A89484]">
                    Pick ready tags guests will notice, or add your own. Popular also feeds the Bestsellers filter.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MENU_TAG_PRESETS.map((preset) => {
                      const selected = editingTags.includes(preset.id);
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => toggleEditingTag(preset.id)}
                          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                            selected
                              ? 'border-[#C4622D]/40 bg-[#FFF4EC] text-[#C4622D]'
                              : 'border-[#E7DDD2] bg-white text-[#6B5A50]'
                          }`}
                        >
                          {preset.id === 'popular' ? <Sparkles className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> : null}
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                  {editingTags.filter((tag) => !MENU_TAG_PRESETS.some((preset) => preset.id === tag)).length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {editingTags
                        .filter((tag) => !MENU_TAG_PRESETS.some((preset) => preset.id === tag))
                        .map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleEditingTag(tag)}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#E7DDD2] bg-[#FBF8F4] px-3 py-1.5 text-xs font-semibold text-[#6B5A50]"
                          >
                            {tag} ×
                          </button>
                        ))}
                    </div>
                  ) : null}
                  <div className="mt-3 flex gap-2">
                    <input
                      value={customTagDraft}
                      onChange={(event) => setCustomTagDraft(event.target.value.slice(0, MAX_TAG_LENGTH))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addCustomEditingTag();
                        }
                      }}
                      placeholder="Add a custom tag"
                      className={`${fieldClass} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={addCustomEditingTag}
                      className="cursor-pointer rounded-xl border border-[#E7DDD2] bg-white px-3 py-2 text-sm font-semibold text-[#1C1410]"
                    >
                      Add
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-[#A89484]">{editingTags.length}/{MAX_ITEM_TAGS} tags</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Description</label>
                  <textarea
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className={`${fieldClass} resize-none`}
                    placeholder="Ingredients, preparation style, spice level"
                  />
                </div>

                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#8A7568]">Dish photo</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="relative h-24 w-24 shrink-0">
                      <button
                        type="button"
                        className={`flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-[#E7DDD2] bg-[#FBF8F4] ${editingItem.image ? 'cursor-zoom-in' : 'cursor-default'}`}
                        onClick={() => {
                          if (editingItem.image) setPreviewImage(editingItem.image);
                        }}
                      >
                        {editingItem.image ? (
                          <img src={editingItem.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-[#D4C4B5]" />
                        )}
                      </button>
                      {editingItem.image ? (
                        <button
                          type="button"
                          aria-label="Remove photo"
                          onClick={() => setEditingItem(prev => ({ ...prev, image: null }))}
                          className="absolute -right-1.5 -top-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-none bg-[#1C1410] text-white shadow-sm"
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
                          className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#E7DDD2] bg-white px-4 py-2.5 text-xs font-semibold text-[#1C1410] ${(uploadingItemImage || generatingAiImage) ? 'pointer-events-none opacity-50' : ''}`}
                        >
                          {uploadingItemImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                          Upload photo
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateAiImage}
                          disabled={uploadingItemImage || generatingAiImage}
                          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none bg-[#FFF4EC] px-4 py-2.5 text-xs font-bold text-[#C4622D] disabled:opacity-50"
                        >
                          {generatingAiImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                          {generatingAiImage ? 'Generating…' : 'Generate with AI'}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-[#A89484]">Square photo works best. Maximum 1MB.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="shrink-0 border-t border-[#E7DDD2] bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={closeItemEditor}
                  disabled={savingItem || uploadingItemImage || generatingAiImage}
                  className="h-11 cursor-pointer rounded-xl border border-[#E7DDD2] bg-white text-sm font-semibold text-[#1C1410] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveItem}
                  disabled={savingItem || uploadingItemImage || generatingAiImage}
                  className="inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none bg-[#C4622D] text-sm font-semibold text-white disabled:opacity-50"
                >
                  {savingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
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
