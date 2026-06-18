import { useCallback, useEffect, useMemo, useState, createContext } from 'react';
import PropTypes from 'prop-types';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const local = localStorage.getItem('shopez_cart');
    return local ? JSON.parse(local) : [];
  });

  useEffect(() => {
    localStorage.setItem('shopez_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existItem = prevItems.find((item) => item.product === product._id);
      
      if (existItem) {
        // Prevent exceeding available stock
        const finalQty = Math.min(existItem.quantity + quantity, product.inventory);
        return prevItems.map((item) =>
          item.product === product._id ? { ...item, quantity: finalQty } : item
        );
      }
      
      return [
        ...prevItems,
        {
          product: product._id,
          name: product.name,
          price: product.price,
          discount: product.discount || 0,
          imageUrl: product.imageUrl,
          seller: product.seller._id || product.seller,
          quantity: Math.min(quantity, product.inventory),
          inventory: product.inventory,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product === productId ? { ...item, quantity: Math.max(1, Math.min(item.inventory, quantity)) } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const subtotal = useMemo(
    () =>
      cartItems.reduce((acc, item) => {
        const activePrice = item.price - (item.price * item.discount) / 100;
        return acc + activePrice * item.quantity;
      }, 0),
    [cartItems]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const providerValue = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal,
      cartCount,
    }),
    [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, cartCount]
  );

  return (
    <CartContext.Provider value={providerValue}>
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
