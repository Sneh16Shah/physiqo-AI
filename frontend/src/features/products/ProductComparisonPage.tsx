import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productApi, Product } from '../../api/product.api';

export const ProductComparisonPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  const productIds = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    // Load all products to populate the "add product" dropdown
    productApi.getProducts({ limit: 100 })
      .then(res => setAllProducts(Array.isArray(res) ? res : (res.items || [])))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (productIds.length > 0) {
      setLoading(true);
      productApi.compareProducts(productIds)
        .then(data => setProducts(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setProducts([]);
    }
  }, [searchParams]);

  const addProduct = (id: string) => {
    if (productIds.includes(id) || productIds.length >= 4) return;
    const newIds = [...productIds, id];
    setSearchParams({ ids: newIds.join(',') });
  };

  const removeProduct = (id: string) => {
    const newIds = productIds.filter(pid => pid !== id);
    if (newIds.length > 0) {
      setSearchParams({ ids: newIds.join(',') });
    } else {
      setSearchParams({});
    }
  };

  const availableProducts = allProducts.filter(p => !productIds.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Compare Products</h1>
        <Link to="/products" className="text-brand-500 hover:text-brand-400 text-sm font-medium">
          Back to Catalog
        </Link>
      </div>

      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 overflow-x-auto">
        {productIds.length === 0 ? (
          <div className="text-center py-12 text-surface-400">
            <p className="mb-4">No products selected for comparison.</p>
            <select 
              className="bg-surface-950 border border-surface-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 max-w-xs"
              onChange={(e) => {
                if (e.target.value) addProduct(e.target.value);
                e.target.value = '';
              }}
            >
              <option value="">Select a product to start...</option>
              {availableProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
              ))}
            </select>
          </div>
        ) : loading ? (
          <div className="text-center py-12 text-surface-400">Loading comparison...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="p-4 border-b border-surface-800 w-48 font-medium text-surface-400">Feature</th>
                {products.map(p => (
                  <th key={p.id} className="p-4 border-b border-surface-800 w-1/4 align-top">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs text-brand-500 font-bold">{p.brand}</div>
                      <button onClick={() => removeProduct(p.id)} className="text-surface-500 hover:text-red-500 text-xs">✕</button>
                    </div>
                    <div className="text-lg font-bold text-white line-clamp-2 mb-2">{p.name}</div>
                    <div className="h-24 bg-surface-950 rounded flex items-center justify-center mb-2">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="max-h-full object-contain" />
                      ) : (
                        <span className="text-2xl">💊</span>
                      )}
                    </div>
                  </th>
                ))}
                {products.length < 4 && (
                  <th className="p-4 border-b border-surface-800 align-top">
                    <select 
                      className="w-full bg-surface-950 border border-surface-800 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-brand-500"
                      onChange={(e) => {
                        if (e.target.value) addProduct(e.target.value);
                        e.target.value = '';
                      }}
                    >
                      <option value="">+ Add Product</option>
                      {availableProducts.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800 text-sm">
              <tr>
                <td className="p-4 text-surface-400">Price</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 text-white font-bold">
                    {p.current_lowest_price ? `$${p.current_lowest_price.toFixed(2)}` : 'N/A'}
                  </td>
                ))}
                {products.length < 4 && <td></td>}
              </tr>
              <tr>
                <td className="p-4 text-surface-400">Category</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 text-surface-300">{p.category.replace('_', ' ')}</td>
                ))}
                {products.length < 4 && <td></td>}
              </tr>
              <tr>
                <td className="p-4 text-surface-400">Serving Size</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 text-surface-300">{p.serving_size ? `${p.serving_size}g` : '-'}</td>
                ))}
                {products.length < 4 && <td></td>}
              </tr>
              <tr>
                <td className="p-4 text-surface-400">Calories</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 text-surface-300">{p.calories_per_serving || '-'}</td>
                ))}
                {products.length < 4 && <td></td>}
              </tr>
              <tr>
                <td className="p-4 text-surface-400">Protein</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 text-brand-400 font-bold">{p.protein_per_serving ? `${p.protein_per_serving}g` : '-'}</td>
                ))}
                {products.length < 4 && <td></td>}
              </tr>
              <tr>
                <td className="p-4 text-surface-400">Price per Serving</td>
                {products.map(p => {
                  const pps = (p.current_lowest_price && p.servings_per_container) 
                    ? (p.current_lowest_price / p.servings_per_container).toFixed(2) 
                    : null;
                  return (
                    <td key={p.id} className="p-4 text-surface-300">{pps ? `$${pps}` : '-'}</td>
                  );
                })}
                {products.length < 4 && <td></td>}
              </tr>
              <tr>
                <td className="p-4 text-surface-400">Verified</td>
                {products.map(p => (
                  <td key={p.id} className="p-4">
                    {p.is_verified ? <span className="text-green-500 font-bold">Yes</span> : <span className="text-surface-500">No</span>}
                  </td>
                ))}
                {products.length < 4 && <td></td>}
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductComparisonPage;
