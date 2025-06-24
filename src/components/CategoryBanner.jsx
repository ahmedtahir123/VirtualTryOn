import React from 'react';

const CategoryBanner = ({ category, productCount }) => {
  const getCategoryInfo = () => {
    switch (category) {
      case 'men':
        return {
          title: "Men's Collection",
          description: "Discover premium menswear crafted for the modern gentleman. From classic essentials to contemporary styles.",
          image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=1200"
        };
      case 'women':
        return {
          title: "Women's Collection",
          description: "Elegant, sophisticated, and timeless pieces designed for the modern woman who values both style and comfort.",
          image: "https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=1200"
        };
      default:
        return {
          title: "All Products",
          description: "Explore our complete collection of premium fashion for men and women. Quality craftsmanship meets contemporary design.",
          image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=1200"
        };
    }
  };

  const { title, description, image } = getCategoryInfo();

  return (
    <div className="relative bg-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {title}
          </h1>
          <p className="text-xl text-gray-300 mb-6 leading-relaxed">
            {description}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{productCount} Products</span>
            <span>•</span>
            <span>Premium Quality</span>
            <span>•</span>
            <span>Fast Shipping</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryBanner;