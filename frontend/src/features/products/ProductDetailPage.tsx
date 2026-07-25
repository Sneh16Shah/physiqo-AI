import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi, Product } from '../../api/product.api';
import { toast } from '../../stores/toastStore';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => {
    if (id) {
      productApi.getProductById(id)
        .then(data => setProduct(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSetAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !targetPrice) return;
    try {
      await productApi.createPriceAlert({
        product_id: id,
        target_price: parseFloat(targetPrice),
      });
      setShowModal(false);
      setTargetPrice('');
      toast.success(`We will notify you when ${product?.name || 'this product'} drops below $${parseFloat(targetPrice).toFixed(2)}.`, 'Price Alert Set');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to set price alert. You may already have an active alert for this product.', 'Alert Creation Failed');
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (!product) return <div className="text-white">Product not found</div>;

  return (
    <div className="space-y-6">
      <Link to="/products" className="text-brand-500 hover:text-brand-400 text-sm flex items-center gap-1">
        ← Back to Catalog
      </Link>

      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 bg-surface-950 rounded-lg flex items-center justify-center p-8 border border-surface-800/50">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="max-w-full h-auto" />
          ) : (
            <div className="text-6xl">💊</div>
          )}
        </div>
        
        <div className="w-full md:w-2/3 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-brand-500 font-bold tracking-wide text-sm mb-1">{product.brand}</div>
              <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-surface-800 text-surface-200 px-3 py-1 rounded-full text-xs font-medium">
                  {product.category.replace('_', ' ')}
                </span>
                {product.is_verified && (
                  <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                    ✓ VERIFIED
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-surface-400 text-sm">Best Price</div>
              <div className="text-4xl font-bold text-white">
                {product.current_lowest_price ? `$${product.current_lowest_price.toFixed(2)}` : 'N/A'}
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="mt-3 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
              >
                Set Price Alert
              </button>
            </div>
          </div>
          
          <div className="text-surface-300 text-sm leading-relaxed mb-8">
            {product.description || 'No description available for this product.'}
          </div>

          <div className="mt-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Nutrition Facts</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-surface-950 border border-surface-800 rounded-lg p-3 text-center">
                <div className="text-surface-400 text-xs mb-1">Serving Size</div>
                <div className="font-bold text-white">{product.serving_size || '-'}g</div>
              </div>
              <div className="bg-surface-950 border border-surface-800 rounded-lg p-3 text-center">
                <div className="text-surface-400 text-xs mb-1">Calories</div>
                <div className="font-bold text-white">{product.calories_per_serving || '-'}</div>
              </div>
              <div className="bg-surface-950 border border-surface-800 rounded-lg p-3 text-center">
                <div className="text-brand-400 text-xs mb-1">Protein</div>
                <div className="font-bold text-white text-lg">{product.protein_per_serving || '-'}g</div>
              </div>
              <div className="bg-surface-950 border border-surface-800 rounded-lg p-3 text-center">
                <div className="text-surface-400 text-xs mb-1">Carbs / Fat</div>
                <div className="font-bold text-white">{product.carbs_per_serving || '-'}g / {product.fat_per_serving || '-'}g</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Modal for Price Alert */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Set Price Alert</h2>
            <p className="text-surface-400 text-sm mb-4">
              We'll notify you when <strong>{product.name}</strong> drops below your target price.
            </p>
            <form onSubmit={handleSetAlert}>
              <div className="mb-4">
                <label className="block text-surface-300 text-sm mb-2">Target Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={targetPrice}
                  onChange={e => setTargetPrice(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500"
                  placeholder="e.g. 29.99"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-surface-300 hover:text-white transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors text-sm font-medium"
                >
                  Create Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
