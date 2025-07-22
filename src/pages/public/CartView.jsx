import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useAppContexts';
import { formatCurrency } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ShoppingCart, Trash2, CreditCard } from 'lucide-react';

export default function CartView() {
    const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <Card className="text-center py-10">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
                <p className="text-muted-foreground">Parece que aún no has agregado productos.</p>
                <Button onClick={() => navigate('/')} className="mt-4">Volver a la Tienda</Button>
            </Card>
        );
    }

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Tu Carrito</h2>
            <div className="space-y-4">
                {cartItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b border-border pb-4">
                        <div className="flex items-center gap-4">
                            <img src={item.imageUrls?.[0]} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                            <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-muted-foreground">{formatCurrency(item.promoPrice || item.salePrice)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input 
                                type="number" 
                                value={item.quantity} 
                                onChange={e => updateQuantity(item.id, parseInt(e.target.value))} 
                                className="w-16 text-center" 
                                min="1"
                            />
                            <Button variant="destructive" size="icon" onClick={() => removeFromCart(item.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 text-right">
                <p className="text-xl font-bold">Total: {formatCurrency(cartTotal)}</p>
                <Button onClick={() => navigate('/checkout')} className="mt-4">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceder al Pago
                </Button>
            </div>
        </Card>
    );
}
