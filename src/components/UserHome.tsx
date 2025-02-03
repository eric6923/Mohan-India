import React, { useState, useEffect } from 'react';
import { Loader2, Layout, Search } from 'lucide-react';
import UserProducts from './UserProducts';

interface Category {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

function ProductCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://mohar-india.vercel.app/api/category');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg backdrop-blur-lg bg-opacity-90 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Layout className="h-8 w-8 text-indigo-600 animate-pulse" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                Mohar India
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Product Categories
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Browse our product categories
              </p>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 ease-in-out"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
              <p className="text-gray-600">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Layout className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories available</h3>
              <p className="text-gray-500">Please check back later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="aspect-w-16 aspect-h-9 rounded-t-xl overflow-hidden">
                    <div className="w-full h-48 relative">
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                      {category.name}
                    </h3>
                    {/* <p className="mt-2 text-sm text-gray-500">
                      Added on {new Date(category.createdAt).toLocaleDateString()}
                    </p> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* UserProducts View */}
        {selectedCategory && (
          <UserProducts category={selectedCategory} onClose={() => setSelectedCategory(null)} />
        )}
      </div>
    </div>
  );
}

export default ProductCategory;