'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { auth } from '@/lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
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
  Download,
  QrCode
} from 'lucide-react';
import { toast } from 'react-toastify';

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedMenuId, setCopiedMenuId] = useState(false);

  const handleCopyMenuUrl = (shortCode: string) => {
    const fullUrl = getQrUrl(shortCode);
    navigator.clipboard.writeText(fullUrl);
    setCopiedMenuId(true);
    toast.success('Menu QR scan URL copied!');
    setTimeout(() => setCopiedMenuId(false), 2000);
  };

  const downloadMenuQR = (shortCode: string, menuName: string) => {
    const svg = document.getElementById(`menu-qr-${shortCode}`);
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
        downloadLink.download = `menu-qr-${menuName.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
  };

  // Menu settings modal
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Partial<Menu> | null>(null);
  const [savingMenu, setSavingMenu] = useState(false);

  const fetchMenusList = async (selectId?: number) => {
    setMenusLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/restaurant/menus', {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/restaurant/menu?menuId=${selectedMenuId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = await auth.currentUser?.getIdToken();
      const method = editingMenu.id ? 'PUT' : 'POST';
      const res = await fetch('/api/restaurant/menus', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingMenu)
      });
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
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/restaurant/menus?id=${selectedMenuId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/restaurant/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCatName, menuId: selectedMenuId })
      });
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
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/restaurant/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id, name: editingCatName })
      });
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
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/restaurant/categories?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = await auth.currentUser?.getIdToken();
      await fetch('/api/restaurant/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          categories: list.map(c => ({ id: c.id, order: c.order }))
        })
      });
      await fetchMenuHierarchy();
    } catch (e) {
      toast.error('Reordering failed');
    }
  };

  // Item Actions
  const handleItemToggle = async (item: MenuItem) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/restaurant/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id: item.id, isAvailable: !item.isAvailable })
      });
      if (res.ok) {
        toast.success(`${item.name} is now ${!item.isAvailable ? 'Available' : 'Sold Out'}`);
        await fetchMenuHierarchy();
      }
    } catch (e) {
      toast.error('Failed to toggle availability');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingItemImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });
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
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/restaurant/items/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemName })
      });
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
      const token = await auth.currentUser?.getIdToken();
      const method = editingItem.id ? 'PUT' : 'POST';
      const res = await fetch('/api/restaurant/items', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingItem)
      });
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
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/restaurant/items?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = await auth.currentUser?.getIdToken();
      await fetch('/api/restaurant/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: list.map(i => ({ id: i.id, order: i.order }))
        })
      });
      await fetchMenuHierarchy();
    } catch (e) {
      toast.error('Failed to reorder items');
    }
  };

  const currentMenu = menus.find(m => m.id === selectedMenuId) || null;
  const currencySymbol = restaurant?.currency === 'USD' ? '$' : restaurant?.currency === 'EUR' ? '€' : '₹';

  const themesList = [
    { id: 'modern', name: 'Modern Card', desc: 'Stylish grid of dish cards with rich images' },
    { id: 'minimal', name: 'Minimal List', desc: 'Sleek, text-focused menu for high readability' },
    { id: 'premium', name: 'Premium Restaurant', desc: 'Elegant theme with script fonts and golden accents' },
    { id: 'cafe', name: 'Cafe Layout', desc: 'Cozy, high-contrast layout matching bistro vibes' },
    { id: 'gourmet', name: 'Gourmet Luxury', desc: 'Sophisticated dark theme with golden borders and fine dining vibes' },
    { id: 'street', name: 'Street Food', desc: 'Vibrant, high-energy layout with warm appetizing colors' }
  ];

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#001B50] mb-1">Menu Management</h1>
          <p className="text-slate-500 text-sm">Create and organize multiple menus, categories, and dishes.</p>
        </div>

        {/* Menu selectors & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
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
              setEditingMenu(currentMenu ? { ...currentMenu } : null);
              setShowMenuModal(true);
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer border border-slate-250 flex items-center gap-1.5 text-xs font-bold"
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
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-primary rounded-xl transition-colors cursor-pointer border border-slate-250 flex items-center gap-1.5 text-xs font-bold"
            title="Create New Menu"
          >
            <Plus className="w-4 h-4" />
            New Menu
          </button>

          {menus.length > 1 && (
            <button
              onClick={handleDeleteMenu}
              className="p-2.5 bg-red-50 hover:bg-red-100 text-red-655 rounded-xl transition-colors cursor-pointer border border-red-200 flex items-center gap-1.5 text-xs font-bold"
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
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-[#001b50] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer border-none"
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col h-fit">
            <div className="flex items-center justify-between mb-4 px-2">
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
              <div className="space-y-1.5 flex-1 max-h-[500px] overflow-y-auto pr-1">
                {categories.map((cat, index) => {
                  const isSelected = activeTabCategoryId === cat.id;
                  const isEditing = editingCatId === cat.id;
                  return (
                    <div 
                      key={cat.id} 
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
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-primary"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleEditCategory(cat.id)}
                            disabled={savingCat}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setEditingCatId(null)}
                            className="p-1 text-red-655 hover:bg-red-50 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setActiveTabCategoryId(cat.id)}
                            className="flex-1 text-left font-semibold text-sm truncate pl-1 pr-2 cursor-pointer"
                          >
                            {cat.name}
                            <span className="text-[10px] text-slate-400 font-normal ml-1.5">({cat.items?.length || 0})</span>
                          </button>

                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all">
                            <button
                              onClick={() => handleReorderCategories(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded disabled:opacity-30"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleReorderCategories(index, 'down')}
                              disabled={index === categories.length - 1}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded disabled:opacity-30"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => {
                                setEditingCatId(cat.id);
                                setEditingCatName(cat.name);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(cat.id)}
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
            )}

            {/* Direct Menu QR Code Section */}
            {currentMenu && currentMenu.qrCode && (
              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col items-center text-center">
                <span className="text-[10px] text-slate-450 uppercase tracking-widest font-bold mb-3 font-sans flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-primary" />
                  Direct Menu QR Code
                </span>
                
                {/* Hidden SVG for download */}
                <div className="hidden">
                  <QRCodeSVG
                    id={`menu-qr-${currentMenu.qrCode.shortCode}`}
                    value={getQrUrl(currentMenu.qrCode.shortCode)}
                    size={500}
                    fgColor="#000000"
                    bgColor="#FFFFFF"
                    level="H"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-center max-w-[130px] shadow-inner mb-3">
                  <QRCodeSVG
                    value={getQrUrl(currentMenu.qrCode.shortCode)}
                    size={100}
                    fgColor="#000000"
                    bgColor="#FFFFFF"
                    level="H"
                  />
                </div>

                <div className="text-xs font-bold text-[#001B50] mb-2 truncate max-w-full px-2">
                  {currentMenu.name}
                </div>

                <div className="flex gap-2 w-full mt-2">
                  <button
                    onClick={() => handleCopyMenuUrl(currentMenu.qrCode!.shortCode)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] border border-slate-200 transition-all cursor-pointer select-none"
                  >
                    {copiedMenuId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    Copy URL
                  </button>
                  <button
                    onClick={() => downloadMenuQR(currentMenu.qrCode!.shortCode, currentMenu.name)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-primary hover:bg-[#001b50] text-white font-bold rounded-lg text-[10px] border-none transition-all cursor-pointer select-none"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                </div>

                <div className="flex justify-between w-full text-[9px] text-slate-400 mt-4 border-t border-slate-100/60 pt-3 px-1">
                  <span>Scans: <strong>{currentMenu.qrCode.totalScans}</strong></span>
                  <span>Unique: <strong>{currentMenu.qrCode.uniqueScans}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Dishes Inventory List */}
          <div className="lg:col-span-3 space-y-6">
            {activeCategory ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                {/* Category info bar */}
                <div className="flex items-center justify-between border-b border-slate-150 pb-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#001B50]">{activeCategory.name}</h2>
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
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-primary/10 hover:bg-primary/15 text-primary font-bold rounded-xl text-xs transition-colors cursor-pointer border-none"
                  >
                    <Plus className="w-4 h-4" />
                    Add Menu Item
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
                      <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4 group">
                        {/* Image / Icon */}
                        <div 
                          className={`w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 transition-all ${item.image ? 'cursor-zoom-in hover:border-primary/40' : ''}`}
                          onClick={() => {
                            if (item.image) setPreviewImage(item.image);
                          }}
                        >
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
                          ) : (
                            <Utensils className="w-6 h-6 text-slate-400" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-base truncate">{item.name}</h4>
                            <div className="flex items-center gap-1 shrink-0">
                              {item.isVeg && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-bold border border-emerald-100">Veg</span>
                              )}
                              {item.isNonVeg && (
                                <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-655 text-[9px] font-bold border border-red-150">Non-Veg</span>
                              )}
                              {item.isVegan && (
                                <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-655 text-[9px] font-bold border border-green-155">Vegan</span>
                              )}
                              {item.isPopular && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[9px] font-bold border border-amber-100 flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> Pop
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-slate-500 text-xs mt-1 line-clamp-2 max-w-2xl">{item.description || 'No description added yet.'}</p>
                          
                          <div className="flex items-center gap-4 mt-2">
                            {/* Price / Variants display */}
                            {item.variants && item.variants.length > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {item.variants.map((v, vi) => (
                                  <span key={vi} className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                                    {v.label}: {currencySymbol}{Number(v.price).toFixed(0)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm font-bold text-slate-800">{currencySymbol}{Number(item.price).toFixed(2)}</span>
                            )}
                            
                            <button
                              onClick={() => handleItemToggle(item)}
                              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                                item.isAvailable 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                                  : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${item.isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              {item.isAvailable ? 'Available' : 'Sold Out'}
                            </button>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleReorderItems(activeCategory.items, index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReorderItems(activeCategory.items, index, 'down')}
                            disabled={index === activeCategory.items.length - 1}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem({ ...item });
                              setShowItemModal(true);
                            }}
                            className="p-1.5 text-blue-600 hover:text-blue-750 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-red-655 hover:text-red-750 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

              {/* Layout Theme Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide">Menu Layout Theme</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {themesList.map((theme) => {
                    const isSelected = editingMenu.theme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setEditingMenu(prev => ({ ...prev, theme: theme.id }))}
                        className={`p-4 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer select-none ${
                          isSelected 
                            ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20' 
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold text-xs text-[#001B50] flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-primary" />
                          {theme.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">{theme.desc}</div>
                      </button>
                    );
                  })}
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

      {/* Add / Edit MenuItem Modal */}
      {showItemModal && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#001B50] mb-6">{editingItem.id ? 'Edit Menu Item' : 'Add Menu Item'}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Dish Name</label>
                <input 
                  type="text" 
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm focus:outline-none"
                  placeholder="e.g. Butter Chicken"
                />
              </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Base Price ({currencySymbol})</label>
                  <input 
                    type="number" 
                    value={editingItem.price === 0 ? '' : editingItem.price}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm focus:outline-none"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Used when no size variants are set.</p>
                </div>

              {/* Multi-size Variants Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Size / Portion Variants</label>
                    <p className="text-[10px] text-slate-400 mt-0.5">e.g. Quarter ₹80 · Half ₹150 · Full ₹250</p>
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
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/15 text-primary font-bold rounded-lg text-xs cursor-pointer border-none transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    Add Size
                  </button>
                </div>

                {editingItem.variants && editingItem.variants.length > 0 ? (
                  <div className="space-y-2">
                    {editingItem.variants.map((variant, vi) => (
                      <div key={vi} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={variant.label}
                          onChange={(e) => {
                            const updated = [...(editingItem.variants || [])];
                            updated[vi] = { ...updated[vi], label: e.target.value };
                            setEditingItem(prev => ({ ...prev, variants: updated }));
                          }}
                          placeholder="e.g. Half"
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary/20 focus:border-primary focus:outline-none"
                        />
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-3 py-2">
                          <span className="text-xs text-slate-400 shrink-0">{currencySymbol}</span>
                          <input
                            type="number"
                            value={variant.price === 0 ? '' : variant.price}
                            onChange={(e) => {
                              const updated = [...(editingItem.variants || [])];
                              updated[vi] = { ...updated[vi], price: Number(e.target.value) };
                              setEditingItem(prev => ({ ...prev, variants: updated }));
                            }}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            className="w-20 text-xs text-slate-800 font-semibold focus:outline-none bg-transparent"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editingItem.variants || []).filter((_, i) => i !== vi);
                            setEditingItem(prev => ({ ...prev, variants: updated.length > 0 ? updated : null }));
                          }}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-2">No size variants. Click "Add Size" to add pricing tiers.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Dietary Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingItem(prev => ({ ...prev, isVeg: true, isNonVeg: false }))}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      editingItem.isVeg 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Veg
                  </button>
                  <button
                    onClick={() => setEditingItem(prev => ({ ...prev, isVeg: false, isNonVeg: true }))}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      editingItem.isNonVeg 
                        ? 'border-red-500 bg-red-50 text-red-600' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Non-Veg
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-650 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea 
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none focus:outline-none"
                  placeholder="Ingredients, preparation style, spice level..."
                />
              </div>

              <div className="flex items-center gap-6 py-2 border-y border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={editingItem.isVegan || false}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, isVegan: e.target.checked }))}
                    className="rounded text-primary focus:ring-primary border-slate-300 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-slate-600">Vegan Dish</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={editingItem.isPopular || false}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, isPopular: e.target.checked }))}
                    className="rounded text-primary focus:ring-primary border-slate-300 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Popular / Best Seller
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-650 mb-1.5 uppercase tracking-wide">Dish Image</label>
                <div className="flex items-center gap-4">
                  <div 
                    className={`w-20 h-20 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative transition-all ${editingItem.image ? 'cursor-zoom-in hover:border-primary/40' : ''}`}
                    onClick={() => {
                      if (editingItem.image) setPreviewImage(editingItem.image);
                    }}
                  >
                    {editingItem.image ? (
                      <img src={editingItem.image} alt="Dish Preview" className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-350" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file"
                      accept="image/*" 
                      id="item-img-upload" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      disabled={uploadingItemImage || generatingAiImage}
                    />
                    <div className="flex flex-wrap gap-2">
                      <label 
                        htmlFor="item-img-upload" 
                        className={`inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer border border-slate-200 transition-all select-none ${(uploadingItemImage || generatingAiImage) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploadingItemImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Upload Photo
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateAiImage}
                        disabled={uploadingItemImage || generatingAiImage}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/15 text-primary font-bold rounded-xl text-xs cursor-pointer transition-all select-none disabled:opacity-50 border-none"
                      >
                        {generatingAiImage ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Generate with AI
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Recommended: 1:1 square ratio, max 1MB.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
              <button 
                onClick={() => {
                  setShowItemModal(false);
                  setEditingItem(null);
                }}
                disabled={savingItem || uploadingItemImage || generatingAiImage}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-650 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveItem}
                disabled={savingItem || uploadingItemImage || generatingAiImage}
                className="px-5 py-2.5 bg-primary hover:bg-[#001b50] rounded-xl text-xs font-semibold text-white disabled:opacity-50 cursor-pointer flex items-center gap-1.5 border-none"
              >
                {savingItem && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Dish
              </button>
            </div>
          </div>
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
    </div>
  );
}
