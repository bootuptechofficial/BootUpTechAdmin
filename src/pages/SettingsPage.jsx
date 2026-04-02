import { useState, useEffect } from 'react';
import { Save, Loader } from 'lucide-react';
import { fetchAdminSettings, updateSettings } from '../utils/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: '', siteDescription: '', keywords: '', 
    themeMode: '', primaryColor: '', font: '', trackingId: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminSettings()
      .then(res => {
        const settingsObj = res.data.settings || {};
        // res.data.settings is an object keyed by setting name
        setSettings(prev => ({ ...prev, ...settingsObj }));
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Server expects a plain object with key: value pairs
      const updates = { ...settings };
      await updateSettings(updates);
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Global Settings</h1>
          <p className="text-dark-400 text-sm mt-1">Configure your platform's core identity and integrations.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="admin-card p-6 space-y-6">
          <h2 className="text-lg font-bold text-white mb-2 pb-2 border-b border-dark-700">General Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full md:col-span-1">
              <label className="block text-sm font-medium text-dark-300 mb-1.5 ml-1">Site/App Name</label>
              <input 
                name="siteName" value={settings.siteName || ''} onChange={handleChange} 
                className="admin-input" placeholder="BootUP Tech" 
              />
            </div>
            
            <div className="col-span-full">
              <label className="block text-sm font-medium text-dark-300 mb-1.5 ml-1">Meta Description</label>
              <textarea 
                name="siteDescription" value={settings.siteDescription || ''} onChange={handleChange} 
                className="admin-input h-24 resize-none" 
                placeholder="A brief description for search engines..." 
              />
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-dark-300 mb-1.5 ml-1">Meta Keywords</label>
              <input 
                name="keywords" value={settings.keywords || ''} onChange={handleChange} 
                className="admin-input" placeholder="tech, tutorials, free software" 
              />
              <p className="text-xs text-dark-500 mt-1 ml-1">Comma-separated values</p>
            </div>
          </div>
        </div>

        <div className="admin-card p-6 space-y-6">
          <h2 className="text-lg font-bold text-white mb-2 pb-2 border-b border-dark-700">Appearance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5 ml-1">Default Theme</label>
              <select name="themeMode" value={settings.themeMode || 'dark'} onChange={handleChange} className="admin-input">
                <option value="dark">Dark Mode (Cinematic)</option>
                <option value="light">Light Mode</option>
                <option value="system">System Preference</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5 ml-1">Primary Brand Color (Hex)</label>
              <div className="flex gap-3">
                <input type="color" name="primaryColor" value={settings.primaryColor || '#7C3AED'} onChange={handleChange} className="w-12 h-11 rounded-lg cursor-pointer bg-dark-800 border border-dark-600 p-1" />
                <input type="text" name="primaryColor" value={settings.primaryColor || '#7C3AED'} onChange={handleChange} className="admin-input uppercase font-mono h-11" placeholder="#7C3AED" />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card p-6 space-y-6">
          <h2 className="text-lg font-bold text-white mb-2 pb-2 border-b border-dark-700">Integrations</h2>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5 ml-1">Google Analytics Tracking ID</label>
            <input 
              name="trackingId" value={settings.trackingId || ''} onChange={handleChange} 
              className="admin-input font-mono" placeholder="G-XXXXXXXXXX" 
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 sticky bottom-4 z-10">
          <button 
            type="submit" 
            disabled={saving}
            className="admin-btn-primary flex items-center gap-2 px-8 py-3 text-lg"
          >
            {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
