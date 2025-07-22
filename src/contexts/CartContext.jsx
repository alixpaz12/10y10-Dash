import React, { useState, useMemo, createContext, useContext } from 'react';

export const CartContext = createContext(null);

// Exportamos el hook desde aquí
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (product, quantity) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prevItems, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(p => p.filter(i => i.id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            setCartItems(p => p.map(i => (i.id === productId ? { ...i, quantity: newQuantity } : i)));
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = useMemo(() => {
        return cartItems.reduce((t, i) => t + (i.promoPrice || i.salePrice) * i.quantity, 0);
    }, [cartItems]);

    const value = { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
