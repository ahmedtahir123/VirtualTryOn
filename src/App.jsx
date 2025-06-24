import React, { useState, useMemo } from 'react';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProducts';
import CategoryBanner from './components/CategoryBanner';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import { products } from './data/products';

function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeCategory, searchQuery]);

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onSearchChange={setSearchQuery}
        />
        
        {/* Show Hero only on 'all' category and no search */}
        {activeCategory === 'all' && !searchQuery && (
          <>
            <Hero />
            <FeaturedProducts products={products} />
          </>
        )}

        {/* Category Banner for filtered views */}
        {(activeCategory !== 'all' || searchQuery) && (
          <CategoryBanner category={activeCategory} productCount={filteredProducts.length} />
        )}

        {/* Products Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {searchQuery && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-gray-600">{filteredProducts.length} products found</p>
              </div>
            )}
            
            <ProductGrid products={filteredProducts} />
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">LUXE</h3>
                <p className="text-gray-400">
                  Premium fashion for the modern lifestyle. Quality craftsmanship meets contemporary design.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Shop</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Women</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Men</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Sale</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Customer Care</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Connect</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Newsletter</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; 2025 LUXE. All rights reserved.</p>
            </div>
          </div>
        </footer>

        <Cart />
      </div>
    </CartProvider>
  );
}

export default App;