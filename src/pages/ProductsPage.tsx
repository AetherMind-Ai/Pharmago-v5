import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom'; // Import useSearchParams
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { Grid, List, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { FilterOptions } from '../types'; // Import FilterOptions
import { db } from '../firebaseConfig'; // Import db
import { collection, getDocs, query, where } from 'firebase/firestore'; // Import Firestore functions

const ProductsPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams(); // Use useSearchParams
  const searchQuery = searchParams.get('query'); // Get query from searchParams
  const categoryQuery = searchParams.get('category'); // Get category from searchParams

  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(24); // 24 products per page
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'grid-2-col'>('grid'); // 'grid', 'list', or 'grid-2-col'
  const [filters, setFilters] = useState<FilterOptions>(() => {
    // Initialize filters based on URL params
    const initialFilters: FilterOptions = {
      priceRange: [0, 1000],
      brands: [],
      categories: [],
      inStockOnly: false,
      deliveryTime: [],
      minRating: 0,
      pharmacyNames: [],
    };

    if (categoryQuery) {
      initialFilters.categories = [categoryQuery];
    }
    // Add other initial filters from URL params if needed

    return initialFilters;
  });
  const [loading, setLoading] = useState(true); // New loading state

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productsCollectionRef = collection(db, 'products');
        let q = query(productsCollectionRef);

        // Apply search query
        if (searchQuery) {
          const lowerCaseSearchQuery = searchQuery.toLowerCase();
          // This is a basic client-side filter for search. For more robust search,
          // consider full-text search solutions like Algolia or Firebase Extensions.
          // For now, we'll fetch all and filter client-side if a search query exists.
        }

        const querySnapshot = await getDocs(q);
        let fetchedProducts: Product[] = [];

        // Fetch reviews for each product
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const product: Product = {
            id: doc.id,
            ...data,
            expiryDate: data.expiryDate ? data.expiryDate.toDate() : null, // Convert Timestamp to Date
            rating: 0, // Default to 0
            reviewCount: 0, // Default to 0
          } as Product;

          // Fetch comments/reviews for the current product
          const commentsCollectionRef = collection(db, 'comments');
          const commentsQuery = query(commentsCollectionRef, where('productId', '==', product.id));
          const commentsSnapshot = await getDocs(commentsQuery);

          let totalRating = 0;
          let reviewCount = 0;

          commentsSnapshot.docs.forEach(commentDoc => {
            const commentData = commentDoc.data();
            if (typeof commentData.rating === 'number') {
              totalRating += commentData.rating;
              reviewCount++;
            }
          });

          if (reviewCount > 0) {
            product.rating = totalRating / reviewCount;
            product.reviewCount = reviewCount;
          }

          fetchedProducts.push(product);
        }

        // Apply client-side search filter after fetching
        if (searchQuery) {
          const lowerCaseSearchQuery = searchQuery.toLowerCase();
          fetchedProducts = fetchedProducts.filter(product =>
            product.name.toLowerCase().includes(lowerCaseSearchQuery) ||
            product.brand.toLowerCase().includes(lowerCaseSearchQuery) ||
            product.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchQuery))
          );
        }

        // Apply sidebar filters
        if (filters.brands.length > 0) {
          fetchedProducts = fetchedProducts.filter(product => filters.brands.includes(product.brand));
        }
        if (filters.categories.length > 0) {
          fetchedProducts = fetchedProducts.filter(product => filters.categories.includes(product.category));
        }
        if (filters.inStockOnly) {
          fetchedProducts = fetchedProducts.filter(product => product.inStock);
        }
        if (filters.deliveryTime.length > 0) {
          fetchedProducts = fetchedProducts.filter(product => filters.deliveryTime.includes(product.deliveryTime));
        }
        if (filters.pharmacyNames.length > 0) {
          fetchedProducts = fetchedProducts.filter(product => product.pharmacyName && filters.pharmacyNames.includes(product.pharmacyName));
        }
        fetchedProducts = fetchedProducts.filter(product => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]);

        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Handle error (e.g., show a message to the user)
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    setCurrentPage(1); // Reset to first page on new search or filter change
  }, [searchQuery, filters, categoryQuery]); // Depend on searchQuery, filters, and categoryQuery

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
