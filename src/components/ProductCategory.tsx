import React, { useState, useEffect } from 'react';
import { PlusCircle, Loader2, ImagePlus, X, Pencil, Trash2, Layout, Search, Filter, ChevronDown } from 'lucide-react';
import Products from './Products';

interface Category {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

function ProductCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setPreviewUrl(editingCategory.imageUrl);
      setShowDialog(true);
    }
  }, [editingCategory]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      // Add key as a separate parameter for better clarity
      formData.append('key', '841ab1ff4aad5cbad451373e17e9a4ca');

      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`ImgBB upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Add proper error handling for the ImgBB response
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to upload image');
      }

      // Ensure we have the correct path to the URL
      if (!data.data?.url) {
        throw new Error('No image URL received from ImgBB');
      }

      return data.data.url;
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (!selectedFile && !editingCategory)) return;

    setCreating(true);
    try {
      let imageUrl = editingCategory ? editingCategory.imageUrl : '';
      
      if (selectedFile) {
        try {
          imageUrl = await uploadImage(selectedFile);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
          setCreating(false);
          return;
        }
      }
      
      const url = editingCategory 
        ? `https://mohar-india.vercel.app/api/category/${editingCategory.id}`
        : 'https://mohar-india.vercel.app/api/category';

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error creating/updating category:', error);
      alert('Failed to save category. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `https://mohar-india.vercel.app/api/category/${category.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(category);
  };

  const resetForm = () => {
    setName('');
    setSelectedFile(null);
    setPreviewUrl('');
    setShowDialog(false);
    setEditingCategory(null);
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
                Mohan India
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
                Manage and organize your product categories
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
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
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
                  <Filter className="h-5 w-5 mr-2 text-gray-400" />
                  Filters
                  <ChevronDown className="ml-2 h-5 w-5 text-gray-400" />
                </button>
                <button
                  onClick={() => setShowDialog(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Category
                </button>
              </div>
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
              <Layout className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-bounce" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first category</p>
              <button
                onClick={() => setShowDialog(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add First Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-w-16 aspect-h-9 rounded-t-xl overflow-hidden">
                    <div className="w-full h-48 relative">
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <button
                          onClick={(e) => handleEdit(category, e)}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transform hover:scale-110 transition-all duration-200"
                        >
                          <Pencil className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(category, e)}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transform hover:scale-110 transition-all duration-200"
                          disabled={deleting}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                      {category.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Added on {new Date(category.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Category Dialog */}
        {showDialog && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all animate-slideIn">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700 transform hover:rotate-90 transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                      placeholder="Enter category name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Image
                    </label>
                    <div className="mt-2 flex flex-col space-y-4">
                      {previewUrl ? (
                        <div className="relative rounded-lg overflow-hidden group">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <label className="cursor-pointer text-white font-medium hover:text-indigo-200 transition-colors">
                              Change Image
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer group">
                          <div className="w-full h-48 rounded-lg bg-gray-50 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 group-hover:border-indigo-500 group-hover:bg-gray-100 transition-all duration-200">
                            <ImagePlus className="h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" />
                            <span className="mt-2 text-sm font-medium text-gray-600 group-hover:text-indigo-600 transition-colors duration-200">
                              Click to upload image
                            </span>
                          </div>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating || !name || (!selectedFile && !editingCategory)}
                      className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          {editingCategory ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        editingCategory ? 'Update Category' : 'Create Category'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Products View */}
        {selectedCategory && (
          <Products category={selectedCategory} onClose={() => setSelectedCategory(null)} />
        )}
      </div>
    </div>
  );
}

export default ProductCategory;