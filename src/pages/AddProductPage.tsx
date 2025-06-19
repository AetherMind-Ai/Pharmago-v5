import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig'; // Assuming firebaseConfig exports db
import { collection, addDoc, setDoc, doc } from 'firebase/firestore'; // Added setDoc and doc
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Import icons for a more modern UI ---
import {
  AlertCircle,
  Wand2,
  RefreshCcw,
  Loader, // Changed from LoaderCircle
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react';

const AddProductPage: React.FC = () => {
  const { userData } = useAuth();

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    image: '',
    images: [] as string[], // Added images array
    category: '',
    brand: '',
    inStock: true,
    rating: 0,
    reviewCount: 0,
    deliveryTime: '90min', // Set default delivery time to 90min
    tags: [] as string[],
    productAmount: 0,
    expiryDate: '',
    prescriptionRequired: false, // Added prescriptionRequired
    pharmacyName: userData?.pharmacyInfo?.name || '',
  });

  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setError(null); // Clear error on input change
    setSuccess(null); // Clear success on input change

    if (name === 'image') {
      setImagePreviewUrl(value);
    }

    setProductData({
      ...productData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProductData({
      ...productData,
      [name]: checked,
    });
  };

  const generateRandomId = () => {
    const randomId = Math.floor(
      1000000000 + Math.random() * 9000000000
    ).toString();
  };

  const generateTags = async () => {
    setTagsLoading(true);
    setTagsError(null);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found in environment variables.');
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      // Using a modern, efficient model. You can change this to 'gemini-pro' if preferred.
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Generate 15 relevant, single-word or two-word, comma-separated, lowercase tags for a product.
      Name: ${productData.name}
      Description: ${productData.description}
      Category: ${productData.category}
      Tags:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const generatedTags = text
        .split(',')
        .map((tag: string) => tag.trim().toLowerCase())
        .filter((tag: string) => tag.length > 0);

      setProductData({ ...productData, tags: generatedTags });
    } catch (err) {
      console.error('Error generating tags:', err);
      setTagsError('Failed to generate tags. Check the console for details.');
    } finally {
      setTagsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Removed productData.id from validation as Firestore will generate it
    if (!productData.name || !productData.price) {
      setError('Please fill in required fields: Name, and Price.');
      setLoading(false);
      return;
    }

    try {
      const productDataToSave = {
        ...productData,
        // Ensure expiryDate is a valid Date object or null
        expiryDate: (productData.expiryDate && !isNaN(new Date(productData.expiryDate).getTime()))
          ? new Date(productData.expiryDate)
          : null,
        price: parseFloat(productData.price.toString()),
        originalPrice: parseFloat(productData.originalPrice.toString()),
        productAmount: parseInt(productData.productAmount.toString(), 10),
      };

      if (!userData?.uid) {
        setError('User not logged in.');
        setLoading(false);
        return;
      }
      const userId = userData.uid;
      console.log("User ID:", userId); // Debugging log
      console.log("Product data to save:", productDataToSave); // Debugging log

      // 1. Add to main 'products' collection
      const docRef = await addDoc(collection(db, 'products'), productDataToSave);
      const newProductId = docRef.id; // Get the auto-generated ID

      // 2. Add to user's subcollection using the same ID
      // Ensure productDataToSave includes the ID for the subcollection copy
      const productDataWithId = { ...productDataToSave, id: newProductId };
      await setDoc(doc(db, `users/${userId}/newproduct`, newProductId), productDataWithId);

      setSuccess('Product added successfully!');

      // Clear form after submission
      setProductData({
        name: '', description: '', price: 0, originalPrice: 0,
        image: '', images: [], category: '', brand: '', inStock: true, rating: 0, // Added images
        reviewCount: 0, deliveryTime: '', tags: [], productAmount: 0,
        expiryDate: '', prescriptionRequired: false, pharmacyName: userData?.pharmacyInfo?.name || '', // Added prescriptionRequired
      });
      setImagePreviewUrl('');

    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Reusable Input Component for cleaner code ---
  const FormInput = ({ label, name, ...props }: any) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        name={name}
        id={name}
        {...props}
        // Updated className for blue border, larger radius, and increased height/padding
        className="block w-full rounded-lg border-blue-500 shadow-sm transition duration-150 ease-in-out sm:text-base p-2"
      />
    </div>
  );

  return (
    // --- Modernized background and container ---
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center">
          Add New Product
        </h2>
        <p className="text-center text-slate-500 mb-8">
          Fill in the details below to add a product to your inventory.
        </p>

        {/* --- Modern Alert Components --- */}
        {error && (
          <div className="flex items-center bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-6">
            <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg relative mb-6">
            <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* --- Section 1: Core Information --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="pharmacyName" className="block text-sm font-medium text-slate-700 mb-1">
                Pharmacy Name
              </label>
              <input
                type="text" name="pharmacyName" id="pharmacyName" value={productData.pharmacyName}
                // Updated className for blue border, larger radius, and increased height/padding
                disabled className="mt-1 block w-full rounded-lg border-blue-500 shadow-sm sm:text-base p-2 bg-slate-100 cursor-not-allowed"
              />
            </div>
            
            <div>
              <FormInput label="Product Name*" name="name" type="text" value={productData.name} onChange={handleInputChange} required />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                name="description" id="description" rows={8} value={productData.description} // Increased rows for more height
                onChange={handleInputChange}
                // Updated className for blue border, larger radius, and increased height/padding
                className="block w-full rounded-lg border-blue-500 shadow-sm transition duration-150 ease-in-out sm:text-base p-2"
              ></textarea>
            </div>
          </div>

          {/* --- Divider for better visual separation --- */}
          <hr className="my-8 border-slate-200" />

          {/* --- Section 2: Pricing and Stock --- */}
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Pricing & Stock</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FormInput label="Price*" name="price" type="number" value={productData.price} onChange={handleInputChange} step="0.01" required />
            <FormInput label="Original Price" name="originalPrice" type="number" value={productData.originalPrice} onChange={handleInputChange} step="0.01" />
            <FormInput label="Quantity" name="productAmount" type="number" value={productData.productAmount} onChange={handleInputChange} min="0" />
            <div className="flex items-end pb-2">
              <div className="flex items-center h-full">
                <input
                  id="inStock" name="inStock" type="checkbox" checked={productData.inStock}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="inStock" className="ml-2 block text-sm text-slate-800">
                  In Stock
                </label>
              </div>
            </div>
            <div className="flex items-end pb-2">
              <div className="flex items-center h-full">
                <input
                  id="prescriptionRequired" name="prescriptionRequired" type="checkbox" checked={productData.prescriptionRequired}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="prescriptionRequired" className="ml-2 block text-sm text-slate-800">
                  Prescription Required
                </label>
              </div>
            </div>
          </div>

          {/* --- Divider for better visual separation --- */}
          <hr className="my-8 border-slate-200" />

          {/* --- Section 3: Categorization & Details --- */}
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Categorization & Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                name="category"
                id="category"
                value={productData.category}
                onChange={handleInputChange}
                className="block w-full rounded-lg border-blue-500 shadow-sm transition duration-150 ease-in-out sm:text-base p-2"
              >
                <option value="">Select a category</option>
                <option value="Medications">Medications</option>
                <option value="Skincare">Skincare</option>
                <option value="Vitamins">Vitamins</option>
                <option value="Baby Care">Baby Care</option>
              </select>
            </div>
             <FormInput label="Brand" name="brand" type="text" value={productData.brand} onChange={handleInputChange} />
             <FormInput label="Delivery Time" name="deliveryTime" type="text" placeholder="e.g., 2-3 days" value={productData.deliveryTime} onChange={handleInputChange} />
             <FormInput label="Expiry Date" name="expiryDate" type="date" value={productData.expiryDate} onChange={handleInputChange} />
          </div>

          <div className="mt-6 md:col-span-2">
              <label htmlFor="image" className="block text-sm font-medium text-slate-700 mb-1">Image URL*</label>
              <input type="text" name="image" id="image" value={productData.image} onChange={handleInputChange} required
              // Updated className for blue border, larger radius, and increased height/padding
              className="mt-1 block w-full rounded-lg border-blue-500 shadow-sm sm:text-base p-2" />
              
              {/* --- Modern Image Preview --- */}
              <div className="mt-4 p-4 border-2 border-dashed border-slate-200 rounded-lg min-h-[12rem] flex justify-center items-center">
                {imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt="Preview" className="max-h-48 w-auto object-contain rounded-md" />
                ) : (
                  <div className="text-center text-slate-400">
                    <ImageIcon className="mx-auto h-12 w-12" />
                    <p className="mt-2 text-sm">Image preview will appear here</p>
                  </div>
                )}
              </div>
            </div>

          {/* --- Divider for better visual separation --- */}
          <hr className="my-8 border-slate-200" />
           
          {/* --- Section 4: AI-Powered Tagging --- */}
           <h3 className="text-lg font-semibold text-slate-700 mb-4">AI-Powered Tagging</h3>
           <div className="md:col-span-2">
              <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-1">Product Tags</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                 <input
                  type="text" name="tags" id="tags"
                  value={productData.tags.join(', ')}
                  onChange={(e) => setProductData({ ...productData, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                  // Updated className for blue border, larger radius, and increased height/padding
                  className="flex-1 block w-full rounded-none rounded-l-lg border-blue-500 shadow-sm transition duration-150 ease-in-out sm:text-base p-2"
                  placeholder="Generate or enter comma-separated tags"
                />
                <button
                  type="button" onClick={generateTags}
                  disabled={tagsLoading || !productData.name || !productData.description}
                  className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-l-0 border-slate-300 bg-indigo-50 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {tagsLoading ? (
                    <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" /> 
                  ) : (
                    <Wand2 className="-ml-1 mr-2 h-5 w-5" />
                  )}
                  <span>{tagsLoading ? 'Generating...' : 'Generate with AI'}</span>
                </button>
              </div>
               {tagsError && <p className="mt-2 text-sm text-red-600">{tagsError}</p>}
               {/* --- Modern Tag "Pill" Display --- */}
               {productData.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {productData.tags.map(tag => (
                    <span key={tag} className="inline-block bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

          {/* --- Modern Submit Button --- */}
          <div className="mt-10 pt-6 border-t border-slate-200">
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /> {/* Changed from LoaderCircle */}
                  Processing...
                </>
              ) : (
                'Add Product to Inventory'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;
