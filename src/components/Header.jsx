import React, { useState } from 'react';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Header = ({ activeCategory, onCategoryChange, onSearchChange }) => {
  const { dispatch, totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange(value);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-slate-800">LUXE</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onCategoryChange('all')}
              className={`text-sm font-medium transition-colors hover:text-amber-600 ${
                activeCategory === 'all' ? 'text-amber-600 border-b-2 border-amber-600 pb-1' : 'text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onCategoryChange('women')}
              className={`text-sm font-medium transition-colors hover:text-amber-600 ${
                activeCategory === 'women' ? 'text-amber-600 border-b-2 border-amber-600 pb-1' : 'text-gray-700'
              }`}
            >
              Women
            </button>
            <button
              onClick={() => onCategoryChange('men')}
              className={`text-sm font-medium transition-colors hover:text-amber-600 ${
                activeCategory === 'men' ? 'text-amber-600 border-b-2 border-amber-600 pb-1' : 'text-gray-700'
              }`}
            >
              Men
            </button>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-700 hover:text-amber-600 transition-colors">
              <User className="h-5 w-5" />
            </button>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="p-2 text-gray-700 hover:text-amber-600 transition-colors relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="p-2 text-gray-700 hover:text-amber-600 transition-colors relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-amber-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    onCategoryChange('all');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left py-2 text-sm font-medium transition-colors hover:text-amber-600 ${
                    activeCategory === 'all' ? 'text-amber-600' : 'text-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    onCategoryChange('women');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left py-2 text-sm font-medium transition-colors hover:text-amber-600 ${
                    activeCategory === 'women' ? 'text-amber-600' : 'text-gray-700'
                  }`}
                >
                  Women
                </button>
                <button
                  onClick={() => {
                    onCategoryChange('men');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left py-2 text-sm font-medium transition-colors hover:text-amber-600 ${
                    activeCategory === 'men' ? 'text-amber-600' : 'text-gray-700'
                  }`}
                >
                  Men
                </button>
              </nav>

              {/* Mobile Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-amber-600 transition-colors">
                  <User className="h-5 w-5" />
                  <span className="text-sm">Account</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;