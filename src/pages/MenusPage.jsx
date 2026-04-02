import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Link as LinkIcon, MoveUp, MoveDown } from 'lucide-react';
import { fetchAdminMenus, createMenu, updateMenu, deleteMenu, reorderMenus } from '../utils/api';
import toast from 'react-hot-toast';

export default function MenusPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialForm = {
    title: '', url: '', location: 'header', parent: '', order: 0, 
    icon: '', isActive: true, targetWrapper: '_self'
  };
  const [formData, setFormData] = useState(initialForm);

  const loadMenus = () => {
    setLoading(true);
    fetchAdminMenus()
      .then(res => setMenus(res.data.menus))
      .catch(() => toast.error('Failed to load menus'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMenus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMenu(editingId, formData);
        toast.success('Menu updated');
      } else {
        await createMenu(formData);
        toast.success('Menu created');
      }
      setIsModalOpen(false);
      loadMenus();
    } catch (err) {
      toast.error('Failed to save menu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this menu item?')) {
      try {
        await deleteMenu(id);
        toast.success('Menu deleted');
        loadMenus();
      } catch (err) {
        toast.error('Failed to delete menu');
      }
    }
  };

  const openModal = (menu = null) => {
    if (menu) {
      setEditingId(menu._id);
      setFormData({
        ...menu,
        parent: menu.parent?._id || ''
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleReorder = async (id, direction) => {
    const parentId = menus.find(m => m._id === id)?.parent?._id || null;
    const location = menus.find(m => m._id === id)?.location;
    
    let siblings = menus.filter(m => 
      m.location === location && 
      (m.parent?._id || null) === parentId
    ).sort((a, b) => a.order - b.order);

    const currentIndex = siblings.findIndex(m => m._id === id);
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === siblings.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Swap the order values
    const newItems = [...siblings];
    const tempOrder = newItems[currentIndex].order;
    newItems[currentIndex].order = newItems[swapIndex].order;
    newItems[swapIndex].order = tempOrder;

    // Build the bulk update payload
    const updatePayload = newItems.map(item => ({
      _id: item._id,
      order: item.order
    }));

    try {
      await reorderMenus(updatePayload);
      loadMenus();
    } catch (err) {
      toast.error('Failed to reorder');
    }
  };

  // Helper to structure menus flat list into a tree for rendering
  const renderMenuTree = (locationName) => {
    const locationMenus = menus.filter(m => m.location === locationName);
    const roots = locationMenus.filter(m => !m.parent).sort((a, b) => a.order - b.order);

    return roots.map(root => (
      <div key={root._id} className="mb-2">
        <MenuRow item={root} isChild={false} />
        {/* Render Children */}
        {locationMenus.filter(m => m.parent?._id === root._id).sort((a, b) => a.order - b.order).map(child => (
          <MenuRow key={child._id} item={child} isChild={true} />
        ))}
      </div>
    ));
  };

  const MenuRow = ({ item, isChild }) => (
    <div className={`flex items-center justify-between p-4 bg-dark-900 border border-dark-700/50 rounded-xl mb-2 hover:border-primary-500/30 transition-colors group ${isChild ? 'ml-8 bg-dark-800' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => handleReorder(item._id, 'up')} className="text-dark-500 hover:text-white"><MoveUp className="w-3 h-3" /></button>
          <button onClick={() => handleReorder(item._id, 'down')} className="text-dark-500 hover:text-white"><MoveDown className="w-3 h-3" /></button>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`font-medium ${item.isActive ? 'text-white' : 'text-dark-500'}`}>{item.title}</span>
            {!item.isActive && <span className="text-xs bg-dark-700 text-dark-300 px-2 py-0.5 rounded">Draft</span>}
          </div>
          <div className="text-xs text-dark-400 mt-1 flex items-center gap-1">
            <LinkIcon className="w-3 h-3" /> {item.url}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => openModal(item)} className="p-2 text-blue-400 hover:bg-dark-700 rounded-lg"><Edit3 className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(item._id)} className="p-2 text-red-400 hover:bg-dark-700 rounded-lg"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Navigation Menus</h1>
          <p className="text-dark-400 text-sm mt-1">Manage links for header, footer, and other areas.</p>
        </div>
        <button onClick={() => openModal()} className="admin-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="admin-card p-6">
          <h2 className="text-lg font-bold text-white border-b border-dark-700 pb-4 mb-4">Header Menu</h2>
          {loading ? <div className="text-center py-8"><div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div> : renderMenuTree('header')}
          {menus.filter(m => m.location === 'header').length === 0 && !loading && (
             <p className="text-dark-400 text-center py-8">No links in header.</p>
          )}
        </div>

        <div className="admin-card p-6">
          <h2 className="text-lg font-bold text-white border-b border-dark-700 pb-4 mb-4">Footer Links</h2>
          {loading ? <div className="text-center py-8"><div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div> : renderMenuTree('footer')}
          {menus.filter(m => m.location === 'footer').length === 0 && !loading && (
             <p className="text-dark-400 text-center py-8">No links in footer.</p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-dark-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Link' : 'Add Link'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-dark-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-dark-300 mb-1">Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="admin-input" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-dark-300 mb-1">URL / Path</label>
                  <input required value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="admin-input" placeholder="/about or https://..." />
                </div>
                
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Location</label>
                  <select value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="admin-input">
                    <option value="header">Header</option>
                    <option value="footer">Footer</option>
                    <option value="sidebar">Sidebar/Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-dark-300 mb-1">Parent (Dropdown)</label>
                  <select value={formData.parent} onChange={e => setFormData({...formData, parent: e.target.value})} className="admin-input">
                    <option value="">None (Top Level)</option>
                    {menus.filter(m => m._id !== editingId && m.location === formData.location && !m.parent).map(m => (
                      <option key={m._id} value={m._id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-dark-300 mb-1">Open In</label>
                  <select value={formData.targetWrapper} onChange={e => setFormData({...formData, targetWrapper: e.target.value})} className="admin-input">
                    <option value="_self">Same Window</option>
                    <option value="_blank">New Tab</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-dark-700 bg-dark-800/50">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 rounded border-dark-600 text-primary-500 bg-dark-900" />
                  <div>
                    <div className="text-sm font-medium text-white">Active</div>
                    <div className="text-xs text-dark-400">Show this link in the menu</div>
                  </div>
                </label>
              </div>

              <div className="flex justify-end pt-4 gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Link</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
