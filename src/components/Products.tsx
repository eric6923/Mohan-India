import React, { useState, useEffect } from 'react';
import { PlusCircle, Loader2, ImagePlus, X, ArrowLeft, Pencil, Trash2, Package } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  actualPrice: string;
  discountedPrice: string;
  categoryId: string;
  createdAt: string;
  category: Category;
}

interface ProductsProps {
  category: Category;
  onClose: () => void;
}

function Products({ category, onClose }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    actualPrice: '',
    discountedPrice: '',
  });

  useEffect(() => {
    fetchProducts();
  }, [category.id]);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description,
        actualPrice: editingProduct.actualPrice,
        discountedPrice: editingProduct.discountedPrice,
      });
      setPreviewUrl(editingProduct.imageUrl);
      setShowAddDialog(true);
    }
  }, [editingProduct]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://mohar-india.vercel.app/api/products');
      const data = await response.json();
      const categoryProducts = data.filter(
        (product: Product) => product.categoryId === category.id
      );
      setProducts(categoryProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
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
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(
      'https://api.imgbb.com/1/upload?key=841ab1ff4aad5cbad451373e17e9a4ca',
      {
        method: 'POST',
        body: formData,
      }
    );
    const data = await response.json();
    return data.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || (!selectedFile && !editingProduct)) return;

    setCreating(true);
    try {
      let imageUrl = editingProduct ? editingProduct.imageUrl : '';
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }
      
      const url = editingProduct
        ? `https://mohar-india.vercel.app/api/products/${editingProduct.id}`
        : 'https://mohar-india.vercel.app/api/products';

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageUrl,
          categoryId: category.id,
          actualPrice: parseInt(formData.actualPrice),
          discountedPrice: parseInt(formData.discountedPrice),
        }),
      });

      if (response.ok) {
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      console.error('Error creating/updating product:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `https://mohar-india.vercel.app/api/products/${product.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      actualPrice: '',
      discountedPrice: '',
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setShowAddDialog(false);
    setEditingProduct(null);
  };

  const calculateDiscount = (actual: string, discounted: string) => {
    const actualPrice = parseFloat(actual);
    const discountedPrice = parseFloat(discounted);
    if (actualPrice && discountedPrice) {
      return Math.round(((actualPrice - discountedPrice) / actualPrice) * 100);
    }
    return 0;
  };

  return (
    <div className="fixed inset-0 bg-gray-50/95 overflow-y-auto pt-16 sm:pt-20"> {/* Adjusted padding for mobile */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-full transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 flex-shrink-0" />
                <span className="truncate">{category.name}</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-500 mt-0.5 sm:mt-1">Manage products in this category</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mb-4" />
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first product</p>
              <button
                onClick={() => setShowAddDialog(true)}
                className="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="relative pt-[75%] sm:pt-[100%]"> {/* Adjusted aspect ratio for mobile */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  {/* Discount Badge */}
                  {calculateDiscount(product.actualPrice, product.discountedPrice) > 0 && (
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-green-500 text-white px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                      {calculateDiscount(product.actualPrice, product.discountedPrice)}% OFF
                    </div>
                  )}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 sm:mb-4 line-clamp-2 min-h-[2.5rem]">
                      {product.description}
                    </p>
                    <div className="flex items-baseline gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl font-bold text-indigo-600">
                        ₹{product.discountedPrice}
                      </span>
                      {product.actualPrice !== product.discountedPrice && (
                        <span className="text-xs sm:text-sm text-gray-500 line-through">
                          ₹{product.actualPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-1.5 sm:p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200"
                      title="Edit product"
                    >
                      <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-1.5 sm:p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors duration-200"
                      disabled={deleting}
                      title="Delete product"
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Product Dialog */}
        {showAddDialog && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4" style={{ zIndex: 100 }}>
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-5 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    {editingProduct ? (
                      <>
                        <Pencil className="h-5 w-5 text-indigo-600" />
                        Edit Product
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-5 w-5 text-indigo-600" />
                        Add New Product
                      </>
                    )}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Image
                    </label>
                    <div className="mt-1 flex flex-col sm:flex-row items-center gap-4">
                      {previewUrl ? (
                        <div className="relative w-full sm:w-32 h-48 sm:h-32">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="absolute inset-0 w-full h-full object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      ) : (
                        <div className="w-full sm:w-32 h-48 sm:h-32 rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                          <ImagePlus className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <label className="w-full sm:w-auto flex-shrink-0 cursor-pointer">
                        <span className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
                          {previewUrl ? 'Change Image' : 'Upload Image'}
                        </span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Actual Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                        <input
                          type="number"
                          value={formData.actualPrice}
                          onChange={(e) =>
                            setFormData({ ...formData, actualPrice: e.target.value })
                          }
                          className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discounted Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                        <input
                          type="number"
                          value={formData.discountedPrice}
                          onChange={(e) =>
                            setFormData({ ...formData, discountedPrice: e.target.value })
                          }
                          className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating || !formData.name || (!selectedFile && !editingProduct)}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          {editingProduct ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        editingProduct ? 'Update Product' : 'Create Product'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;