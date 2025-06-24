import React, { useState } from 'react';
import { Heart, Plus, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductModal from './ProductModal';
import VirtualTryOn from './VirtualTryOn';

const ProductCard = ({ product }) => {
  const { dispatch } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVirtualTryOnOpen, setIsVirtualTryOnOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (product.sizes.length > 0) {
      setIsModalOpen(true);
    }
  };

  const handleVirtualTryOn = (e) => {
    e.stopPropagation();
    setIsVirtualTryOnOpen(true);
  };

  const handleAddToCart = (size) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, size } });
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.featured && (
              <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Featured
              </span>
            )}
            {product.originalPrice && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Sale
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`p-2 rounded-full backdrop-blur-sm transition-all hover:scale-110 ${
                isLiked ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleVirtualTryOn}
              className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:scale-110 transition-all shadow-lg"
              title="Virtual Try-On"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              onClick={handleQuickAdd}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:scale-110 transition-all"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Action Buttons Row */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2">
              <button
                onClick={handleVirtualTryOn}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all text-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Try On
              </button>
              <button
                onClick={handleQuickAdd}
                className="flex-1 bg-slate-900/90 backdrop-blur-sm text-white py-2 px-3 rounded-lg font-medium hover:bg-slate-900 transition-all text-sm"
              >
                Quick Add
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {product.sizes.slice(0, 3).map((size) => (
                <span
                  key={size}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 3 && (
                <span className="text-xs text-gray-500">+{product.sizes.length - 3}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
        onVirtualTryOn={() => {
          setIsModalOpen(false);
          setIsVirtualTryOnOpen(true);
        }}
      />

      <VirtualTryOn
        product={product}
        isOpen={isVirtualTryOnOpen}
        onClose={() => setIsVirtualTryOnOpen(false)}
      />
    </>
  );
};

export default ProductCard;