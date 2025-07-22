/*
 * RUTA DEL ARCHIVO: src/components/shared/ProductCard.jsx
 * DESCRIPCIÓN: NUEVO ARCHIVO. Este componente define cómo se ve
 * cada tarjeta de producto individual en el catálogo.
 */
import React, { useState, useMemo } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ShoppingCart, Minus, Plus } from 'lucide-react';

const formatCurrency = (amount) => `L. ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ProductCard({ product }) {
    const { cartItems, addToCart, updateQuantity } = useCart();
    const { showToast } = useNotification();
    const [quantity, setQuantity] = useState(1);
    const itemInCart = useMemo(() => cartItems.find(item => item.id === product.id), [cartItems, product.id]);

    const handleAddToCart = () => {
        addToCart(product, quantity);
        showToast(`${quantity} x ${product.name} agregado al carrito!`, 'success');
    };

    return (
        <Card className="flex flex-col group overflow-hidden">
            <div className="relative">
                <img 
                    src={product.imageUrls?.[0] || 'https://placehold.co/400x400/212121/white?text=10y10'} 
                    alt={product.name} 
                    className="w-full h-64 object-contain rounded-t-lg transform group-hover:scale-105 transition-transform duration-300" 
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x400/212121/white?text=Imagen+no+disponible'; }}
                />
                {product.promoPrice && <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">OFERTA</div>}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-foreground flex-grow">{product.name}</h3>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>{product.category}</span>
                    <span>{product.gender}</span>
                </div>
                <div className="mt-auto">
                    <div className="flex items-baseline gap-2 mb-4">
                        {product.promoPrice ? (
                            <>
                                <p className="text-2xl font-bold text-destructive">{formatCurrency(product.promoPrice)}</p>
                                <p className="text-md text-muted-foreground line-through">{formatCurrency(product.salePrice)}</p>
                            </>
                        ) : (
                            <p className="text-2xl font-bold text-primary">{formatCurrency(product.salePrice)}</p>
                        )}
                    </div>
                    {itemInCart ? (
                        <div className="flex items-center justify-center gap-2">
                            <Button variant="secondary" onClick={() => updateQuantity(product.id, itemInCart.quantity - 1)} className="rounded-full w-10 h-10"><Minus className="h-4 w-4"/></Button>
                            <span className="font-bold text-lg w-10 text-center">{itemInCart.quantity}</span>
                            <Button variant="secondary" onClick={() => updateQuantity(product.id, itemInCart.quantity + 1)} className="rounded-full w-10 h-10"><Plus className="h-4 w-4"/></Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value)))} className="w-16 text-center" />
                            <Button onClick={handleAddToCart} className="w-full flex-grow">
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Agregar
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}