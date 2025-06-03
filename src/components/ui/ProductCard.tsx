import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative pb-[70%] overflow-hidden">
          <img 
            src={product.image} 
            alt={product.title}
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium text-gray-800 line-clamp-1">{product.title}</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
              {product.category}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition-colors duration-200"
              aria-label="Add to cart"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            {product.stock > 10 ? (
              <span className="text-green-600">In Stock</span>
            ) : product.stock > 0 ? (
              <span className="text-orange-500">Only {product.stock} left</span>
            ) : (
              <span className="text-red-500">Out of Stock</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;