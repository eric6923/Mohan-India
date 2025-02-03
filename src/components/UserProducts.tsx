import React, { useState, useEffect } from "react";
import {
  Loader2,
  ArrowLeft,
  Package,
  Search,
  MessageSquare
} from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchProducts();
  }, [category.id]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://mohar-india.vercel.app/api/products"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const categoryProducts = data.filter(
        (product: Product) => product.categoryId === category.id
      );
      setProducts(categoryProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (actual: string, discounted: string) => {
    const actualPrice = parseFloat(actual);
    const discountedPrice = parseFloat(discounted);
    if (actualPrice && discountedPrice) {
      return Math.round(((actualPrice - discountedPrice) / actualPrice) * 100);
    }
    return 0;
  };

  const handleWhatsAppOrder = (productName: string) => {
    const message = encodeURIComponent(`I would like to order ${productName}`);
    const whatsappUrl = `https://wa.me/919382884078?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-gray-50/95 overflow-y-auto pt-16 sm:pt-20">
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
              <p className="text-sm sm:text-base text-gray-500 mt-0.5 sm:mt-1">
                Browse our collection of products
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mb-4" />
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? "No products found" : "No products yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "No products available in this category"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative pt-[100%] overflow-hidden bg-gray-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Discount Badge */}
                    {calculateDiscount(
                      product.actualPrice,
                      product.discountedPrice
                    ) > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                        {calculateDiscount(
                          product.actualPrice,
                          product.discountedPrice
                        )}
                        % OFF
                      </div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2 line-clamp-2 flex-grow">
                      {product.description}
                    </p>
                    
                    {/* Price Container */}
                    <div className="mt-auto">
                      <div className="flex items-baseline gap-1.5 mb-3">
                        <span className="text-lg sm:text-xl font-bold text-green-600">
                          ₹{product.discountedPrice}
                        </span>
                        {product.actualPrice !== product.discountedPrice && (
                          <span className="text-xs text-gray-500 line-through">
                            ₹{product.actualPrice}
                          </span>
                        )}
                      </div>
                      
                      {/* WhatsApp Order Button */}
                      <button
                        onClick={() => handleWhatsAppOrder(product.name)}
                        className="w-full flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                      >
                    
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;