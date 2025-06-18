import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import CategoryGrid from '../components/CategoryGrid';
import FeaturedBrands from '../components/FeaturedBrands';
import ProductGrid from '../components/ProductGrid';
import FilterSidebar from '../components/FilterSidebar';
import AIDoctor from '../components/AIDoctor';
import { mockProducts } from '../data/mockData';
import { FilterOptions } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 1000],
    brands: [],
    categories: [],
    inStockOnly: false,
    deliveryTime: [],
    minRating: 0
  });

  // Filter products based on current filters
  const filteredProducts = mockProducts.filter(product => {
    const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
    const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.brand);
    const matchesCategory = filters.categories.length === 0 || filters.categories.includes(product.category);
    const matchesStock = !filters.inStockOnly || product.inStock;
    const matchesDelivery = filters.deliveryTime.length === 0 || filters.deliveryTime.includes(product.deliveryTime);
    const matchesRating = product.rating >= filters.minRating;

    return matchesPrice && matchesBrand && matchesCategory && matchesStock && matchesDelivery && matchesRating;
  });

  return (
    <div className="min-h-screen bg-cream">
      <HeroBanner />
      <CategoryGrid />
      <FeaturedBrands />
      
      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Featured Products
            </h2>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden btn-outline flex items-center space-x-2"
            >
              <Filter size={16} />
              <span>{t('filters')}</span>
            </button>
          </div>

          <div className="flex">

            {/* Products Grid */}
            <div className="flex-1">
              <ProductGrid products={filteredProducts.length > 0 ? filteredProducts.slice(0, 15) : mockProducts.slice(0, 15)} />
            </div>
          </div>
        </div>
      </section>

      <AIDoctor />
    </div>
  );
};

export default HomePage;
