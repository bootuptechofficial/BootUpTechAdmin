import { useState, useEffect } from 'react';
import { Save, Loader, CreditCard } from 'lucide-react';
import { fetchAdminSettings, updateSettings } from '../utils/api';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const [settings, setSettings] = useState({
    payment_jazzcash: '',
    payment_easypaisa: '',
    payment_bmca: '',
    payment_patreon: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminSettings()
      .then(res => {
        const settingsObj = res.data.settings || {};
        const s = {};

        // If paymentMethods array exists, map it to individual inputs
        if (Array.isArray(settingsObj.paymentMethods)) {
          settingsObj.paymentMethods.forEach(pm => {
            if (pm.type === 'jazzcash') s.payment_jazzcash = pm.phoneNumber || pm.link || '';
            if (pm.type === 'easypaisa') s.payment_easypaisa = pm.phoneNumber || pm.link || '';
            if (pm.type === 'buymeacoffee') s.payment_bmca = pm.link || '';
            if (pm.type === 'patreon') s.payment_patreon = pm.link || '';
          });
        }

        // Backwards-compat: also pick up legacy payment_ keys if present
        for (const key of Object.keys(settingsObj)) {
          if (key.startsWith('payment_')) s[key] = settingsObj[key];
        }

        setSettings(prev => ({ ...prev, ...s }));
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Build paymentMethods array from the form fields (preserve basic labels/order)
      const paymentMethods = [
        { type: 'buymeacoffee', label: 'Buy Me a Coffee', icon: '☕', link: settings.payment_bmca || '', details: '', isActive: !!settings.payment_bmca, order: 0 },
        { type: 'jazzcash', label: 'JazzCash', icon: '📱', phoneNumber: settings.payment_jazzcash || '', instructions: '', isActive: !!settings.payment_jazzcash, order: 1 },
        { type: 'easypaisa', label: 'Easypaisa', icon: '💚', phoneNumber: settings.payment_easypaisa || '', instructions: '', isActive: !!settings.payment_easypaisa, order: 2 },
        { type: 'patreon', label: 'Patreon', icon: '💳', link: settings.payment_patreon || '', details: '', isActive: !!settings.payment_patreon, order: 3 }
      ];

      // Send both legacy payment_x keys and the structured paymentMethods array
      const updates = { ...settings, paymentMethods };
      await updateSettings(updates);
      toast.success('Payment links updated');
    } catch (err) {
      toast.error('Failed to update links');
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
          <h1 className="text-2xl font-bold text-white">Donation/Payment Links</h1>
          <p className="text-dark-400 text-sm mt-1">Configure the links used in the donation modal.</p>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-2xl flex items-start gap-4">
        <CreditCard className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-300">Link-based Payments</h3>
          <p className="text-sm mt-1 leading-relaxed">
            Since this platform uses a zero-cost infrastructure, we use direct donation links instead of heavy payment gateways. 
            Enter your deep links or web URLs for the supported platforms below. Leave a field blank to hide that option from the users.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="admin-card p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* JazzCash */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5 ml-1">JazzCash Link / Number</label>
              <input 
                name="payment_jazzcash" value={settings.payment_jazzcash || ''} onChange={handleChange} 
                className="admin-input" placeholder="e.g. 03001234567 or deep link" 
              />
            </div>

            {/* Easypaisa */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5 ml-1">Easypaisa Link / Number</label>
              <input 
                name="payment_easypaisa" value={settings.payment_easypaisa || ''} onChange={handleChange} 
                className="admin-input" placeholder="e.g. 03001234567 or deep link" 
              />
            </div>

            {/* Buy Me a Coffee */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5 ml-1">Buy Me a Coffee URL</label>
              <input 
                name="payment_bmca" value={settings.payment_bmca || ''} onChange={handleChange} 
                className="admin-input" placeholder="https://buymeacoffee.com/yourname" 
              />
            </div>

            {/* Patreon */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5 ml-1">Patreon URL</label>
              <input 
                name="payment_patreon" value={settings.payment_patreon || ''} onChange={handleChange} 
                className="admin-input" placeholder="https://patreon.com/yourname" 
              />
            </div>

          </div>
        </div>

        <div className="flex justify-end pt-4 sticky bottom-4 z-10">
          <button 
            type="submit" 
            disabled={saving}
            className="admin-btn-primary flex items-center gap-2 px-8 py-3 text-lg"
          >
            {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Payment Links
          </button>
        </div>
      </form>
    </div>
  );
}
