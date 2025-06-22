import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig'; // Assuming firebaseConfig exports db
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom'; // Import Link for navigation
import ProductCard from '../components/ProductCard'; // Import ProductCard
import { Product, Feedback } from '../types'; // Import Product and Feedback interfaces

const PharmacyProductsPage: React.FC = () => {
  const { userData, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]); // Use Product interface
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); // State for filtered products
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPharmacyProducts = async () => {
      // Ensure userData and uid are available before proceeding
      if (!userData || !userData.uid) {
        if (!authLoading) { // Only set error if authLoading is false, meaning auth process is complete
             setError("User not logged in or UID not available. Cannot fetch products.");
             setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const userId = userData.uid;
        const productsCollectionRef = collection(db, `users/${userId}/newproduct`);
        const querySnapshot = await getDocs(productsCollectionRef);

        const productsList: Product[] = []; // Use Product interface
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          productsList.push({
            id: doc.id,
            name: data.name,
            image: data.image,
            price: data.price,
            brand: data.brand || 'Unknown Brand', // Default
            category: data.category || 'Uncategorized', // Default
            tags: data.tags || [],
            description: data.description || 'No description available.', // Default
            inStock: data.inStock ?? true, // Default to true
            rating: 0, // Initialize rating
            reviewCount: 0, // Initialize reviewCount
            deliveryTime: data.deliveryTime || '2-3 days', // Default
            prescriptionRequired: data.prescriptionRequired || false, // Default
            originalPrice: data.originalPrice || undefined, // Optional
            images: data.images || [], // Ensure images is an array, not undefined
            pharmacyName: data.pharmacyName || undefined, // Optional
            productAmount: data.productAmount || undefined, // Optional
            expiryDate: data.expiryDate ? new Date(data.expiryDate.toDate()) : null, // Convert Firestore Timestamp to Date
          });
        });

          // Fetch comments for each product to calculate rating and reviewCount
          const productsWithReviews = await Promise.all(productsList.map(async (product) => {
            const commentsQuery = query(collection(db, 'comments'), where('productId', '==', product.id));
            const commentsSnapshot = await getDocs(commentsQuery);
            
            let totalRating = 0;
            let reviewCount = 0;

            commentsSnapshot.forEach((doc) => {
              const commentData = doc.data();
              totalRating += commentData.rating;
              reviewCount++;
            });

            const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

            return {
              ...product,
              rating: averageRating,
              reviewCount: reviewCount,
            };
          }));

        setProducts(productsWithReviews);
        setFilteredProducts(productsWithReviews);

      } catch (err) {
        console.error("Error fetching pharmacy products:", err);
        setError("Failed to fetch products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch products if authentication is not loading and userData (with uid) is available
    if (!authLoading && userData?.uid) {
       fetchPharmacyProducts();
    }

  }, [userData?.uid, authLoading]); // Depend on userData.uid and authLoading

  // Effect for search filtering
  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(lowercasedSearchTerm) ||
      product.brand?.toLowerCase().includes(lowercasedSearchTerm) ||
      product.category?.toLowerCase().includes(lowercasedSearchTerm) ||
      product.tags?.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm))
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]); // Re-run effect when products or searchTerm changes

  const handleDeleteProduct = async (productId: string) => {
    if (!userData?.uid) {
      setError("User not logged in. Cannot delete product.");
      return;
    }

    setLoading(true); // Optional: show loading state during deletion
    setError(null);
    try {
      const userId = userData.uid;
      const productDocRef = doc(db, `users/${userId}/newproduct`, productId);
      await deleteDoc(productDocRef);

      // Update local state to remove the deleted product
      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));

      console.log(`Product with ID ${productId} deleted successfully.`);
      // Optionally show a success message to the user
      // toast.success('Product deleted successfully!');

    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product. Please try again.");
      // Optionally show an error message to the user
      // toast.error('Failed to delete product.');
    } finally {
      setLoading(false); // Optional: hide loading state
    }
  };

  if (loading || authLoading) {
    return <div className="p-6">Loading products...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="py-8 px-4 bg-gray-100 min-h-screen"> {/* Added py-8 px-4 */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Your Products</h2> {/* Increased text size and mb */}

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products by name or tags..."
            className="w-full p-3 border border-blue-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredProducts.length === 0 && searchTerm !== '' ? (
          <div className="text-center text-gray-600">
            <p className="text-lg">No products found matching your search.</p>
          </div>
        ) : filteredProducts.length === 0 && searchTerm === '' ? (
          <div className="text-center text-gray-600">
            <p className="text-lg">You haven't added any products yet.</p>
            <p className="mt-2">Go to the <Link to="/dashboard/pharmacy/new-product" className="text-blue-600 hover:underline">Add Product</Link> page to add your first product.</p>
          </div>
        ) : (
          /* Adjusted grid for responsive layout using ProductCard */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onDelete={handleDeleteProduct} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyProductsPage;
