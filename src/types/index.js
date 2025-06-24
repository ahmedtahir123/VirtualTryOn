export const ProductCategories = {
  MEN: 'men',
  WOMEN: 'women'
};

export const ProductTypes = {
  JACKETS: 'jackets',
  SHIRTS: 'shirts',
  PANTS: 'pants',
  DRESSES: 'dresses',
  TOPS: 'tops',
  BOTTOMS: 'bottoms',
  SWEATERS: 'sweaters',
  ACTIVEWEAR: 'activewear'
};

// Type checking helpers for runtime validation
export const isValidProduct = (product) => {
  return product && 
    typeof product.id === 'string' &&
    typeof product.name === 'string' &&
    typeof product.price === 'number' &&
    typeof product.image === 'string' &&
    ['men', 'women'].includes(product.category) &&
    Array.isArray(product.sizes) &&
    typeof product.description === 'string';
};

export const isValidCartItem = (item) => {
  return item &&
    isValidProduct(item.product) &&
    typeof item.size === 'string' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0;
};