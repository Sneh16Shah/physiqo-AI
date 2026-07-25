import React, { useEffect, useState } from 'react';
import { productApi, PriceAlert, Product } from '../../api/product.api';
import { Link } from 'react-router-dom';
import { toast } from '../../stores/toastStore';

interface AlertWithProduct extends PriceAlert {
  product?: Product;
}

export const PriceAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      const data = await productApi.getPriceAlerts();
      const items: PriceAlert[] = Array.isArray(data) ? data : (data.items || []);
      
      const populated = await Promise.all(
        items.map(async (alert) => {
          try {
            const product = await productApi.getProductById(alert.product_id);
            return { ...alert, product };
          } catch {
            return alert;
          }
        })
      );
      
      setAlerts(populated);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load price alerts.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const toggleAlert = async (id: string, currentStatus: boolean) => {
    try {
      await productApi.updatePriceAlert(id, { is_active: !currentStatus });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a));
      toast.info(currentStatus ? 'Price alert paused.' : 'Price alert activated.', 'Alert Status Updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update alert status.', 'Error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalId) return;
    try {
      await productApi.deletePriceAlert(deleteModalId);
      setAlerts(prev => prev.filter(a => a.id !== deleteModalId));
      toast.success('Price alert has been removed.', 'Alert Deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete price alert.', 'Error');
    } finally {
      setDeleteModalId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Price Alerts</h1>
        <Link to="/products" className="text-brand-500 hover:text-brand-400 text-sm font-medium">
          Browse Products
        </Link>
      </div>

      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden shadow-md">
        {loading ? (
          <div className="p-8 text-center text-surface-400">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-lg font-bold text-white mb-2">No Active Alerts</h3>
            <p className="text-surface-400 text-sm mb-6">You haven't set any price alerts yet.</p>
            <Link to="/products" className="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors font-medium">
              Find Products
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-800">
            {alerts.map(alert => (
              <div key={alert.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-800/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-surface-950 rounded-lg flex items-center justify-center shrink-0 border border-surface-800">
                    {alert.product?.image_url ? (
                      <img src={alert.product.image_url} alt={alert.product.name} className="max-h-full object-contain p-1" />
                    ) : (
                      <span className="text-2xl">💊</span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-brand-500 font-bold mb-1">{alert.product?.brand || 'Unknown'}</div>
                    <Link to={`/products/${alert.product_id}`} className="text-lg font-bold text-white hover:text-brand-400 transition-colors line-clamp-1">
                      {alert.product?.name || 'Loading product...'}
                    </Link>
                    <div className="text-sm text-surface-400 mt-1">
                      Current Price: <strong className="text-surface-200">{alert.product?.current_lowest_price ? `$${alert.product.current_lowest_price.toFixed(2)}` : 'N/A'}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 justify-between md:justify-end">
                  <div className="text-center">
                    <div className="text-xs text-surface-500 mb-1">Target Price</div>
                    <div className="text-xl font-bold text-green-400">${alert.target_price.toFixed(2)}</div>
                  </div>
                  
                  <div className="flex items-center gap-3 border-l border-surface-800 pl-6">
                    <label className="flex items-center cursor-pointer relative">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={alert.is_active}
                        onChange={() => toggleAlert(alert.id, alert.is_active)}
                      />
                      <div className="w-11 h-6 bg-surface-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                    </label>
                    
                    <button 
                      onClick={() => setDeleteModalId(alert.id)}
                      className="p-2 text-surface-500 hover:text-red-400 transition-colors rounded-lg hover:bg-surface-800"
                      title="Delete Alert"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sleek Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Delete Price Alert</h3>
            </div>
            <p className="text-surface-300 text-sm leading-relaxed">
              Are you sure you want to delete this price alert? You will no longer receive price drop notifications for this product.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2 text-surface-300 hover:text-white transition-colors text-sm font-medium rounded-lg bg-surface-800 hover:bg-surface-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors text-sm font-medium shadow-md"
              >
                Delete Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceAlertsPage;
