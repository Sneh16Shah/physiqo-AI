import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi, Product, ProductFilterParams } from '../../api/product.api';

export const ProductsCatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<ProductFilterParams>({
    query: '',
    category: '',
    is_verified: false,
  });

  const fetchProducts = async () => {
    try {
      const data = await productApi.getProducts(filters);
      setProducts(Array.isArray(data) ? data : (data.items || []));
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const categories = ['', 'WHEY', 'CASEIN', 'PLANT', 'CREATINE', 'PRE_WORKOUT', 'BCAA', 'OTHER'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Products Catalog</h1>
        <div className="flex gap-2">
          <Link to="/products/compare" className="px-4 py-2 bg-surface-800 text-white rounded-lg hover:bg-surface-700 transition-colors text-sm font-medium">
            Compare Products
          </Link>
          <Link to="/price-alerts" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors text-sm font-medium">
            My Price Alerts
          </Link>
        </div>
      </div>

      <div className="bg-surface-900 p-4 rounded-xl border border-surface-800 flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Search products..." 
          className="flex-1 bg-surface-950 border border-surface-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500"
          value={filters.query || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
        />
        
        <select 
          className="bg-surface-950 border border-surface-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500"
          value={filters.category || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        >
          <option value="">All Categories</option>
          {categories.filter(c => c).map(c => (
            <option key={c} value={c}>{c.replace('_', ' ')}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-white cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={filters.is_verified || false}
            onChange={(e) => setFilters(prev => ({ ...prev, is_verified: e.target.checked }))}
            className="rounded border-surface-800 bg-surface-950 text-brand-500 focus:ring-brand-500"
          />
          Verified Only
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <Link key={product.id} to={`/products/${product.id}`} className="block group">
            <div className="bg-surface-900 rounded-xl border border-surface-800 overflow-hidden hover:border-brand-500 transition-colors h-full flex flex-col">
              <div className="h-48 bg-surface-950 relative p-4 flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-4xl">💊</div>
                )}
                {product.is_verified && (
                  <div className="absolute top-2 right-2 bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-bold border border-green-500/20">
                    VERIFIED
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-xs text-brand-400 font-semibold mb-1">{product.brand}</div>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{product.name}</h3>
                <div className="text-sm text-surface-400 mb-4">{product.category.replace('_', ' ')}</div>
                
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <div className="text-xs text-surface-500">Lowest Price</div>
                    <div className="text-xl font-bold text-white">
                      {product.current_lowest_price ? `$${product.current_lowest_price.toFixed(2)}` : 'N/A'}
                    </div>
                  </div>
                  {product.protein_per_serving && (
                    <div className="text-right">
                      <div className="text-xs text-surface-500">Protein</div>
                      <div className="text-sm font-medium text-white">{product.protein_per_serving}g</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {products.length === 0 && (
        <div className="text-center py-12 text-surface-400 bg-surface-900 rounded-xl border border-surface-800">
          No products found matching your filters.
        </div>
      )}
    </div>
  );
};

export default ProductsCatalogPage;
