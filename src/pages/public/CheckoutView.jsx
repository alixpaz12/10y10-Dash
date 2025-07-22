/*
 * RUTA DEL ARCHIVO: src/pages/public/CheckoutView.jsx
 * DESCRIPCIÓN: Se ha corregido la lógica para asegurar que las compras de
 * clientes registrados se guarden en la colección 'sales' con todos los
 * datos necesarios para que aparezcan en la vista de Órdenes.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../../contexts/NotificationContext';
import { serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import LoginModal from '../../components/modals/LoginModal';
import { CreditCard, CheckCircle, Send } from 'lucide-react';

const formatCurrency = (amount) => `L. ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CheckoutView() {
    const { user, register } = useAuth();
    const { data, addSale, addUnregisteredPurchase } = useData();
    const { cartItems, cartTotal, clearCart } = useCart();
    const { showToast } = useNotification();
    const navigate = useNavigate();

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [whatsappLink, setWhatsappLink] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({ email: '', fullName: '', address: '', phone: '', cityId: '', note: '', wantsToRegister: false, password: '' });
    const [discountCode, setDiscountCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [appliedDiscount, setAppliedDiscount] = useState(null);

    useEffect(() => { if (cartItems.length === 0) { navigate('/'); } }, [cartItems, navigate]);

    useEffect(() => {
        if (user) {
            const userCity = data.shipping_locations.find(l => l.city.toLowerCase() === user.city?.toLowerCase());
            setFormData(prev => ({ ...prev, email: user.email || '', fullName: user.name || '', phone: user.phone || '', cityId: userCity?.id || '', address: user.address || '', wantsToRegister: false }));
        }
    }, [user, data.shipping_locations]);

    const shippingCost = useMemo(() => {
        return data.shipping_locations.find(loc => loc.id === formData.cityId)?.cost || 0;
    }, [formData.cityId, data.shipping_locations]);

    const finalTotal = cartTotal - discountAmount + shippingCost;

    const handleApplyDiscount = () => {
        const code = data.discount_codes.find(c => c.id.toLowerCase() === discountCode.toLowerCase());
        const now = new Date();
        if (code && now >= code.startDate && now <= code.endDate) {
            const newDiscountAmount = (cartTotal * code.percentage) / 100;
            setDiscountAmount(newDiscountAmount);
            setAppliedDiscount(code);
            showToast(`Código '${code.id}' aplicado!`, 'success');
        } else {
            setDiscountAmount(0);
            setAppliedDiscount(null);
            showToast('Código de descuento no válido o expirado.', 'error');
        }
    };

    const handlePurchase = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            for (const item of cartItems) {
                const productRef = doc(db, 'products', item.id);
                const productSnap = await getDoc(productRef);
                if (!productSnap.exists() || !productSnap.data().isPublic || productSnap.data().quantity < item.quantity) {
                    throw new Error(`El producto "${item.name}" ya no está disponible o no tiene suficiente stock.`);
                }
            }
        } catch (error) {
            showToast(error.message, 'error');
            setIsProcessing(false);
            navigate('/cart');
            return;
        }

        const { email, fullName, address, phone, cityId, note, password, wantsToRegister } = formData;
        const cityInfo = data.shipping_locations.find(l => l.id === cityId);

        if (!email || !fullName || !address || !phone || !cityInfo) {
            showToast("Por favor, complete todos los campos de contacto y entrega.", 'error');
            setIsProcessing(false);
            return;
        }

        let userIdForSale = user?.uid;
        let customerNameForSale = fullName;

        if (!user && wantsToRegister) {
            if (!password || password.length < 6) {
                showToast("La contraseña debe tener al menos 6 caracteres.", "error");
                setIsProcessing(false);
                return;
            }
            const userCredential = await register(fullName, email, password, phone, cityInfo.city);
            if (!userCredential) {
                showToast("No se pudo completar el registro. Por favor, intente de nuevo.", "error");
                setIsProcessing(false);
                return;
            }
            userIdForSale = userCredential.user.uid;
        }

        const saleData = {
            customerName: customerNameForSale,
            shippingAddress: address,
            city: cityInfo.city,
            phone,
            note,
            shippingCost,
            items: cartItems.map(i => ({ productId: i.id, productName: i.name, quantity: i.quantity, price: i.promoPrice || i.salePrice, costPrice: i.costPrice })),
            subtotal: cartTotal,
            discount: discountAmount > 0 ? { code: discountCode, amount: discountAmount, percentage: appliedDiscount.percentage } : null,
            total: finalTotal,
            status: 'Pendiente',
            date: serverTimestamp(),
            amountPaid: 0,
            payments: [],
        };

        try {
            if (userIdForSale) {
                const profit = saleData.items.reduce((sum, item) => sum + (item.price - (item.costPrice || 0)) * item.quantity, 0) - (saleData.discount?.amount || 0);
                const storeAdmin = data.users.find(u => u.role === 'admin');

                await addSale({ 
                    ...saleData, 
                    profit, 
                    sellerId: storeAdmin?.id || 'store', 
                    sellerName: storeAdmin?.name || 'Tienda Web 10y10', 
                    userId: userIdForSale,
                    customerId: userIdForSale,
                    commission: { percentage: 0, amount: 0 }
                });
            } else {
                await addUnregisteredPurchase({...saleData, sellerName: 'Tienda Web 10y10', customerEmail: email});
            }
            
            const productLines = saleData.items.map(item => `- ${item.quantity}x ${item.productName}: ${formatCurrency(item.price * item.quantity)}`).join('\n');
            const discountLine = saleData.discount ? `Descuento: -${formatCurrency(saleData.discount.amount)}\n` : '';
            const noteLine = saleData.note ? `\nNota Adicional:\n${saleData.note}\n` : '';
            const detailedMessage = `*Nuevo Pedido de 10y10 Watch Store*\n\n*Detalles del Cliente:*\nNombre: ${saleData.customerName}\nDirección: ${saleData.shippingAddress}\nCiudad: ${saleData.city}\nTeléfono: ${saleData.phone}\n${noteLine}\n*Resumen del Pedido:*\n${productLines}\n\n*Factura:*\nSubtotal: ${formatCurrency(saleData.subtotal)}\n${discountLine}Costo de Envío: ${formatCurrency(saleData.shippingCost)}\n*Total a Pagar: ${formatCurrency(saleData.total)}*\n\n¡Gracias por preferirnos!`;
            const whatsappUrl = `https://api.whatsapp.com/send/?phone=%2B${data.settings.whatsappNumber || ''}&text=${encodeURIComponent(detailedMessage)}`;
            
            setWhatsappLink(whatsappUrl);
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error("Error al procesar la compra:", error);
            showToast(`Hubo un error al procesar tu compra: ${error.message}`, 'error');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleFinalizePurchase = () => {
        clearCart();
        navigate(user ? '/client/purchases' : '/');
    };

    return (
        <>
            <form onSubmit={handlePurchase} className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                {isProcessing && <LoadingOverlay />}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Información de Contacto</h2>
                        {!user && <Button type="button" variant="link" onClick={() => setIsLoginModalOpen(true)}>¿Ya tienes cuenta? Iniciar Sesión</Button>}
                    </div>
                    <Input name="email" placeholder="Correo Electrónico" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} required/>
                    <h2 className="text-2xl font-bold pt-4">Detalles de Entrega</h2>
                    <Select name="cityId" value={formData.cityId} onChange={e => setFormData(p => ({...p, cityId: e.target.value}))} required>
                        <option value="" disabled>Seleccione una ciudad</option>
                        {data.shipping_locations.map(loc => (<option key={loc.id} value={loc.id}>{loc.city}</option>))}
                    </Select>
                    <Input name="fullName" placeholder="Nombre y Apellido" value={formData.fullName} onChange={e => setFormData(p => ({...p, fullName: e.target.value}))} required/>
                    <Input name="address" placeholder="Dirección Exacta de Envío" value={formData.address} onChange={e => setFormData(p => ({...p, address: e.target.value}))} required/>
                    <Input name="phone" placeholder="Número de Teléfono" value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} required/>
                    <textarea name="note" placeholder="Nota adicional para tu pedido (opcional)" value={formData.note} onChange={e => setFormData(p => ({...p, note: e.target.value}))} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    {!user && (
                        <div className="p-4 border-t border-border mt-4 space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="wantsToRegister" checked={formData.wantsToRegister} onChange={e => setFormData(p => ({...p, wantsToRegister: e.target.checked}))} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"/>
                                <span className="font-medium text-foreground">Guardar mi información y crear una cuenta</span>
                            </label>
                            {formData.wantsToRegister && (
                                <div className="pl-8 animate-fade-in-up">
                                    <Input name="password" type="password" placeholder="Crear una contraseña (mínimo 6 caracteres)" value={formData.password} onChange={e => setFormData(p => ({...p, password: e.target.value}))} required={formData.wantsToRegister} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="bg-muted/50 dark:bg-muted p-6 rounded-lg space-y-4 self-start sticky top-24">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">Resumen del Pedido</h2>
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img src={item.imageUrls?.[0]} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{item.quantity}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(item.promoPrice || item.salePrice)}</p>
                                    </div>
                                </div>
                                <p className="font-semibold text-foreground">{formatCurrency((item.promoPrice || item.salePrice) * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 pt-4">
                        <Input placeholder="Código de Descuento" value={discountCode} onChange={e => setDiscountCode(e.target.value)} />
                        <Button type="button" onClick={handleApplyDiscount}>Aplicar</Button>
                    </div>
                    <div className="border-t border-border pt-4 space-y-2 text-foreground">
                        <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(cartTotal)}</span></div>
                        {discountAmount > 0 && <div className="flex justify-between text-green-500"><span>Descuento</span><span>- {formatCurrency(discountAmount)}</span></div>}
                        <div className="flex justify-between"><span>Envío</span><span>{formatCurrency(shippingCost)}</span></div>
                        <div className="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2"><span>Total</span><span>{formatCurrency(finalTotal)}</span></div>
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={isProcessing}>
                        {isProcessing ? <Spinner/> : (formData.wantsToRegister && !user) ? 'Registrarse y Confirmar' : 'Confirmar y Enviar Pedido'}
                    </Button>
                </div>
            </form>
            {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />}
            <Modal isOpen={isSuccessModalOpen} onClose={() => { setIsSuccessModalOpen(false); handleFinalizePurchase(); }}>
                <div className="text-center p-4">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">¡Pedido Registrado!</h2>
                    <p className="text-muted-foreground mb-6">Para finalizar, por favor envía los detalles a nuestro equipo a través de WhatsApp. Nos pondremos en contacto contigo a la brevedad.</p>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" onClick={() => { setIsSuccessModalOpen(false); handleFinalizePurchase(); }}>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                            <Send className="mr-2 h-4 w-4" /> Enviar Pedido por WhatsApp
                        </Button>
                    </a>
                </div>
            </Modal>
        </>
    );
}