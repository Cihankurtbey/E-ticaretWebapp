import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    productsAPI.getCategories().then(res => setCategories(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage, limit: 12 };
        if (currentCategory) params.category = currentCategory;
        if (currentSort) params.sort = currentSort;
        if (currentSearch) params.search = currentSearch;
        if (currentMinPrice) params.minPrice = currentMinPrice;
        if (currentMaxPrice) params.maxPrice = currentMaxPrice;

        const response = await productsAPI.getAll(params);
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error('Urunler yuklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentCategory, currentSort, currentSearch, currentPage, currentMinPrice, currentMaxPrice]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="page products-page">
      <div className="container">
        <div className="products-layout">
          {/* Filtreler */}
          <aside className={`filters-panel ${filtersOpen ? 'active' : ''}`}>
            <div className="filters-header">
              <h3>Filtreler</h3>
              <button className="clear-filters" onClick={clearFilters}>Temizle</button>
            </div>

            {/* Kategori */}
            <div className="filter-group">
              <h4>Kategori</h4>
              <div className="filter-options">
                <label className={`filter-option ${!currentCategory ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={!currentCategory}
                    onChange={() => updateFilter('category', '')}
                  />
                  <span>Tümü</span>
                </label>
                {categories.map(cat => (
                  <label key={cat.id} className={`filter-option ${currentCategory === String(cat.id) ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="category"
                      checked={currentCategory === String(cat.id)}
                      onChange={() => updateFilter('category', cat.id)}
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fiyat Araligi */}
            <div className="filter-group">
              <h4>Fiyat Aralığı</h4>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min ₺"
                  value={currentMinPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="Max ₺"
                  value={currentMaxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                />
              </div>
            </div>

            <button className="filters-close-mobile" onClick={() => setFiltersOpen(false)}>
              Filtreleri Uygula
            </button>
          </aside>

          {/* Filtre Overlay */}
          {filtersOpen && <div className="filters-overlay" onClick={() => setFiltersOpen(false)}></div>}

          {/* Urun Listesi */}
          <main className="products-main">
            <div className="products-toolbar">
              <div className="products-info">
                {currentSearch && <span className="search-tag">"{currentSearch}" için sonuçlar</span>}
                <span className="products-count">{pagination.total || 0} ürün bulundu</span>
              </div>
              <div className="products-actions">
                <button className="filter-toggle-btn" onClick={() => setFiltersOpen(true)}>
                  ☰ Filtrele
                </button>
                <select
                  value={currentSort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="sort-select"
                >
                  <option value="">Sıralama</option>
                  <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                  <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                  <option value="rating">En Yüksek Puan</option>
                  <option value="newest">En Yeni</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="products-grid grid grid-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="product-skeleton">
                    <div className="skeleton" style={{ aspectRatio: '1', width: '100%' }}></div>
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="skeleton" style={{ height: '12px', width: '60%' }}></div>
                      <div className="skeleton" style={{ height: '16px', width: '90%' }}></div>
                      <div className="skeleton" style={{ height: '12px', width: '40%' }}></div>
                      <div className="skeleton" style={{ height: '20px', width: '50%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="no-products">
                <span className="no-products-icon">🔍</span>
                <h3>Ürün bulunamadı</h3>
                <p>Farklı filtreler deneyebilirsiniz</p>
                <button className="btn btn-primary" onClick={clearFilters}>Filtreleri Temizle</button>
              </div>
            ) : (
              <>
                <div className="products-grid grid grid-3">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Sayfalama */}
                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      disabled={currentPage <= 1}
                      onClick={() => updateFilter('page', currentPage - 1)}
                    >
                      ← Önceki
                    </button>
                    <div className="pagination-pages">
                      {[...Array(pagination.totalPages)].map((_, i) => (
                        <button
                          key={i}
                          className={`pagination-page ${currentPage === i + 1 ? 'active' : ''}`}
                          onClick={() => updateFilter('page', i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      className="pagination-btn"
                      disabled={currentPage >= pagination.totalPages}
                      onClick={() => updateFilter('page', currentPage + 1)}
                    >
                      Sonraki →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
