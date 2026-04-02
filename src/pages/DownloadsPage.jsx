import { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Download } from 'lucide-react';
import { fetchAdminDownloads, createDownload, updateDownload, deleteDownload } from '../utils/api';
import toast from 'react-hot-toast';

export default function DownloadsManager() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialForm = {
    title: '', description: '', fileSize: '', version: '', downloadUrl: '',
    category: 'General', os: [], isActive: true, image: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const loadDownloads = () => {
    setLoading(true);
    fetchAdminDownloads()
      .then(res => setDownloads(res.data.downloads))
      .catch(() => toast.error('Failed to load downloads'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDownloads(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDownload(editingId, formData);
        toast.success('Download updated');
      } else {
        await createDownload(formData);
        toast.success('Download created');
      }
      setIsModalOpen(false);
      loadDownloads();
    } catch (err) {
      toast.error('Failed to save download');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this download?')) {
      try {
        await deleteDownload(id);
        toast.success('Download deleted');
        loadDownloads();
      } catch (err) {
        toast.error('Failed to delete download');
      }
    }
  };

  const openModal = (dl = null) => {
    if (dl) {
      setEditingId(dl._id);
      setFormData(dl);
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const toggleOS = (os) => {
    setFormData(prev => ({
      ...prev,
      os: prev.os.includes(os) ? prev.os.filter(o => o !== os) : [...prev.os, os]
    }));
  };

  const filteredDownloads = downloads.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) || 
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Downloads</h1>
          <p className="text-dark-400 text-sm mt-1">Manage files, tools, and software resources.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="admin-btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Download
        </button>
      </div>

      <div className="admin-card">
        <div className="p-4 border-b border-dark-700">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input 
              type="text" 
              placeholder="Search downloads..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="admin-input pl-9 py-2 text-sm max-w-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm text-dark-300">
            <thead className="bg-dark-800 text-dark-200">
              <tr>
                <th className="px-5 py-4 font-semibold w-12"></th>
                <th className="px-5 py-4 font-semibold">Title</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">OS/Version</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : filteredDownloads.map(dl => (
                <tr key={dl._id} className={`hover:bg-dark-800/50 transition-colors group ${!dl.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-4">
                    {dl.image ? (
                      <img src={dl.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center border border-dark-700">
                        <Download className="w-5 h-5 text-dark-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{dl.title}</div>
                    <div className="text-xs text-dark-500 mt-0.5 truncate max-w-xs">{dl.description}</div>
                  </td>
                  <td className="px-5 py-4">{dl.category}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1 mb-1">
                      {dl.os.map(o => (
                        <span key={o} className="px-1.5 py-0.5 rounded bg-dark-800 border border-dark-700 text-[10px] uppercase">{o}</span>
                      ))}
                    </div>
                    {(dl.version || dl.fileSize) && (
                      <span className="text-xs text-dark-500">v{dl.version} • {dl.fileSize}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openModal(dl)}
                        className="p-1.5 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 rounded-md transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(dl._id)}
                        className="p-1.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-dark-700 flex justify-between items-center bg-dark-800/50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Download' : 'Add Download'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-dark-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-dark-300 mb-1">Title *</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="admin-input" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm text-dark-300 mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="admin-input h-20 resize-none" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm text-dark-300 mb-1">Download URL *</label>
                  <input required type="url" value={formData.downloadUrl} onChange={e => setFormData({...formData, downloadUrl: e.target.value})} className="admin-input" placeholder="https://" />
                </div>

                <div>
                  <label className="block text-sm text-dark-300 mb-1">Version</label>
                  <input value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} className="admin-input" placeholder="e.g. 1.0.0" />
                </div>

                <div>
                  <label className="block text-sm text-dark-300 mb-1">File Size</label>
                  <input value={formData.fileSize} onChange={e => setFormData({...formData, fileSize: e.target.value})} className="admin-input" placeholder="e.g. 24 MB" />
                </div>

                <div>
                  <label className="block text-sm text-dark-300 mb-1">Category</label>
                  <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="admin-input" />
                </div>

                <div>
                  <label className="block text-sm text-dark-300 mb-1">Image URL (Optional)</label>
                  <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="admin-input" placeholder="https://" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-2">Supported Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {['windows', 'mac', 'linux', 'android', 'ios'].map(os => (
                    <button
                      key={os} type="button"
                      onClick={() => toggleOS(os)}
                      className={`px-3 py-1.5 rounded-lg text-sm border capitalize transition-all
                        ${formData.os.includes(os) ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-dark-800 border-dark-600 text-dark-300'}`}
                    >
                      {os}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-dark-700 bg-dark-800/50">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500 bg-dark-900"
                />
                <div>
                  <div className="text-sm font-medium text-white">Active</div>
                  <div className="text-xs text-dark-400">Visible on the public downloads page</div>
                </div>
              </label>

              <div className="flex justify-end pt-4 gap-3 border-t border-dark-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Download</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
