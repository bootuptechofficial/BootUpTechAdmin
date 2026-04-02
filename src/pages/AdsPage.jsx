import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, MonitorPlay } from 'lucide-react';
import { fetchAdminAds, createAd, updateAd, deleteAd } from '../utils/api';
import toast from 'react-hot-toast';

export default function AdsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ placement: 'header', code: '', isActive: true });

  const loadAds = () => {
    setLoading(true);
    fetchAdminAds()
      .then(res => setAds(res.data.ads))
      .catch(() => toast.error('Failed to load ads'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAds(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.placement || !formData.code) {
      toast.error('All fields are required');
      return;
    }

    try {
      if (editingId) {
        await updateAd(editingId, formData);
        toast.success('Ad updated');
      } else {
        await createAd(formData);
        toast.success('Ad created');
      }
      setIsModalOpen(false);
      loadAds();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save ad');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this ad placement?')) {
      try {
        await deleteAd(id);
        toast.success('Ad deleted');
        loadAds();
      } catch (err) {
        toast.error('Failed to delete ad');
      }
    }
  };

  const openModal = (ad = null) => {
    if (ad) {
      setEditingId(ad._id);
      setFormData({ placement: ad.placement, code: ad.code, isActive: ad.isActive });
    } else {
      setEditingId(null);
      setFormData({ placement: 'header', code: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">AdSense Management</h1>
          <p className="text-dark-400 text-sm mt-1">Manage global ad placements.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="admin-btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Placement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={`ads-skeleton-${i}`} className="admin-card p-6 h-40 animate-pulse bg-dark-800/50" />
          ))
        ) : ads.length === 0 ? (
          <div className="col-span-full admin-card p-12 text-center">
            <MonitorPlay className="w-12 h-12 text-dark-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No ad placements yet</h3>
            <p className="text-dark-400 mb-4">Add your first AdSense unit to start monetizing.</p>
            <button onClick={() => openModal()} className="admin-btn-secondary">Add Placement</button>
          </div>
        ) : ads.map(ad => (
          <div key={ad._id} className={`admin-card p-6 relative group transition-opacity ${!ad.isActive ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20 uppercase tracking-widest">
                  {ad.placement}
                </span>
                <span className={`ml-2 text-xs font-medium ${ad.isActive ? 'text-green-400' : 'text-red-400'}`}>
                  {ad.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex bg-dark-800 rounded-lg overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity border border-dark-700">
                <button onClick={() => openModal(ad)} className="p-2 text-blue-400 hover:bg-dark-700 transition-colors tooltip-trigger" title="Edit">
                  <Edit3 className="w-4 h-4" />
                </button>
                <div className="w-px bg-dark-700" />
                <button onClick={() => handleDelete(ad._id)} className="p-2 text-red-400 hover:bg-dark-700 transition-colors tooltip-trigger" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="bg-dark-950 rounded-xl p-4 border border-dark-800">
              <pre className="text-xs text-dark-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-32">
                {ad.code}
              </pre>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-lg mx-auto">
            <div className="p-6 border-b border-dark-700 flex justify-between items-center bg-dark-800/50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Ad' : 'Add Ad'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-dark-400 hover:text-white transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5 ml-1">Placement Location</label>
                <select 
                  value={formData.placement} 
                  onChange={e => setFormData({...formData, placement: e.target.value})} 
                  className="admin-input cursor-pointer"
                >
                  <option value="header">Header (Global)</option>
                  <option value="footer">Footer (Global)</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="in-content">In-Content (Articles)</option>
                  <option value="after-article">After Article</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5 ml-1">AdSense Code snippet</label>
                <textarea 
                  required
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value})} 
                  className="admin-input h-40 font-mono text-sm resize-none"
                  placeholder="<script async src='...'></script>\n<ins class='adsbygoogle' ...></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-dark-700 bg-dark-800/50 hover:bg-dark-800 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500 bg-dark-900"
                />
                <div>
                  <div className="text-sm font-medium text-white">Active</div>
                  <div className="text-xs text-dark-400 mt-0.5">Show this ad snippet on the site</div>
                </div>
              </label>

              <div className="flex justify-end pt-4 gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Ad</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
