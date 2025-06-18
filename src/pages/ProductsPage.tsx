import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { mockProducts } from '../data/mockData';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { Grid, List, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { FilterOptions } from '../types'; // Import FilterOptions

const ProductsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('query');

  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(24); // 24 products per page
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'grid-2-col'>('grid'); // 'grid', 'list', or 'grid-2-col'
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 1000],
    brands: [],
    categories: [],
    inStockOnly: false,
    deliveryTime: [],
  });

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  useEffect(() => {
    let filtered = mockProducts;

    // Apply search query from URL
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sidebar filters
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => filters.brands.includes(product.brand));
    }
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => filters.categories.includes(product.category));
    }
    if (filters.inStockOnly) {
      filtered = filtered.filter(product => product.inStock);
    }
    if (filters.deliveryTime.length > 0) {
      filtered = filtered.filter(product => filters.deliveryTime.includes(product.deliveryTime));
    }
    filtered = filtered.filter(product => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]);

    setProducts(filtered);
    setCurrentPage(1); // Reset to first page on new search or filter change
  }, [searchQuery, filters]); // Depend on searchQuery and filters

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(products.length / productsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`px-4 py-2 mx-1 rounded-lg ${
            currentPage === i ? 'bg-dark-blue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="flex flex-col lg:flex-row"> {/* Removed py-8 */}
      {/* Filter Sidebar */}
      <div className="w-full lg:w-80 lg:flex-shrink-0 mb-8 lg:mb-0"> {/* Fixed width for sidebar, prevent shrinking */}
        <FilterSidebar 
          isOpen={true} // Always open on desktop, can add mobile toggle later if needed
          onClose={() => {}} // No-op for now, as it's always open
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 lg:pl-8 pt-[80px]"> {/* Take remaining space, add padding, and top padding for header */}
        {/* View Mode Toggles */}
        <div className="flex justify-between items-center mb-4">
          {searchQuery && (
            <h2 className="text-xl font-semibold text-gray-800">
              Results for: "<span className="text-dark-blue">{searchQuery}</span>"
            </h2>
          )}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-dark-blue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title="Grid View"
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('grid-2-col')}
              className={`p-2 rounded-lg ${viewMode === 'grid-2-col' ? 'bg-dark-blue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title="2-Column Grid View"
            >
              <LayoutGrid size={20} /> {/* Using LayoutGrid icon for 2-column view */}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-dark-blue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title="List View"
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Product Grid/List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : viewMode === 'grid-2-col' ? 'grid grid-cols-2 gap-6' : 'flex flex-col gap-6'}>
          {currentProducts.length > 0 ? (
            currentProducts.map(product => (
              <ProductCard key={product.id} product={product} isListView={viewMode === 'list'} />
            ))
          ) : (
            <p className="text-center text-gray-600 text-lg col-span-full">No products found matching your criteria.</p>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-8">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            <ChevronLeft size={20} /> Previous
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Next <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
