/*
 * RUTA DEL ARCHIVO: src/pages/admin/RegisterSaleView.jsx
 * DESCRIPCIÓN: Componente completamente funcional para registrar ventas manuales,
 * asegurando que todos los datos necesarios se guarden correctamente.
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Timestamp } from 'firebase/firestore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import NewCustomerModal from '../../components/modals/NewCustomerModal';
import { Search, Trash2 } from 'lucide-react';

const formatCurrency = (amount) => `L. ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function RegisterSaleView() {
    const { user } = useAuth();
    const { data, addSale } = useData();
    const { showToast } = useNotification();

    const [sellerId, setSellerId] = useState(user.uid);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
    const [saleCart, setSaleCart] = useState([]);
    const [shippingCityId, setShippingCityId] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('full');
    const [commission, setCommission] = useState(50);
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

    const allCustomers = useMemo(() => {
        const manualCustomers = data.customers.map(c => ({...c, type: 'manual'}));
        const webCustomers = data.users.filter(u => u.role === 'client').map(u => ({...u, type: 'web'}));
        return [...manualCustomers, ...webCustomers].sort((a,b) => a.name.localeCompare(b.name));
    }, [data.customers, data.users]);

    const filteredCustomers = useMemo(() => {
        if (!customerSearchTerm) return allCustomers;
        return allCustomers.filter(c => 
            c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
            (c.email && c.email.toLowerCase().includes(customerSearchTerm.toLowerCase()))
        );
    }, [allCustomers, customerSearchTerm]);

    const displayableProducts = useMemo(() => data.products.filter(p => p.quantity > 0 && p.name.toLowerCase().includes(searchTerm.toLowerCase())), [data.products, searchTerm]);
    
    const totals = useMemo(() => {
        const subtotal = saleCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const grossProfit = saleCart.reduce((sum, item) => sum + (item.price - (item.costPrice || 0)) * item.quantity, 0);
        const shippingInfo = data.shipping_locations.find(loc => loc.id === shippingCityId);
        const shippingCost = shippingInfo?.cost || 0;
        const finalTotal = subtotal + shippingCost;
        const netProfit = grossProfit;
        const commissionAmount = (netProfit * commission) / 100;
        return { subtotal, profit: netProfit, shippingCost, finalTotal, commissionAmount, shippingCityName: shippingInfo?.city || '' };
    }, [saleCart, shippingCityId, data.shipping_locations, commission]);

    useEffect(() => {
        if (selectedCustomerId) {
            const customer = allCustomers.find(c => c.id === selectedCustomerId);
            if (customer) {
                setShippingAddress(customer.address || '');
                const location = data.shipping_locations.find(l => l.city?.toLowerCase() === customer.city?.toLowerCase());
                setShippingCityId(location?.id || '');
            }
        } else {
            setShippingAddress('');
            setShippingCityId('');
        }
    }, [selectedCustomerId, allCustomers, data.shipping_locations]);

    const handleCustomerChange = (customerId) => {
        if (customerId === '__new__') {
            setIsNewCustomerModalOpen(true);
            setSelectedCustomerId('');
        } else {
            setSelectedCustomerId(customerId);
        }
    };

    const handleProductSelect = (product) => {
        setSaleCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === product.id);
            if (existingItem) {
                if (existingItem.quantity < product.quantity) {
                    return prevCart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
                } else {
                    showToast(`No hay más stock de ${product.name}`, 'error');
                    return prevCart;
                }
            }
            return [...prevCart, { productId: product.id, name: product.name, quantity: 1, price: product.promoPrice || product.salePrice, costPrice: product.costPrice }];
        });
    };

    const handleCartQuantityChange = (productId, newQuantity) => {
        const numQuantity = parseInt(newQuantity);
        if (isNaN(numQuantity) || numQuantity < 1) {
            handleRemoveFromCart(productId);
            return;
        }
        setSaleCart(prevCart => prevCart.map(item => item.productId === productId ? {...item, quantity: numQuantity} : item));
    };

    const handleRemoveFromCart = (productId) => setSaleCart(prevCart => prevCart.filter(item => item.productId !== productId));

    const resetSaleForm = () => {
        setSaleCart([]); setSelectedCustomerId(''); setShippingCityId(''); setShippingAddress(''); setPaymentMethod('full'); setCommission(50); setSaleDate(new Date().toISOString().split('T')[0]);
    };

    const handleCompleteSale = async () => {
        if (!selectedCustomerId || !shippingCityId || !shippingAddress || saleCart.length === 0) {
            showToast("Complete todos los campos: cliente, envío y productos.", 'error');
            return;
        }
        
        const customer = allCustomers.find(c => c.id === selectedCustomerId);
        const seller = data.users.find(u => u.id === sellerId);
        if (!customer || !seller) {
            showToast("Error: Cliente o vendedor no válido.", 'error');
            return;
        }
        
        const now = new Date();
        const [year, month, day] = saleDate.split('-').map(Number);
        const finalSaleDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());

        const newSale = {
            date: Timestamp.fromDate(finalSaleDate),
            sellerId,
            sellerName: seller.name,
            customerId: selectedCustomerId,
            customerName: customer.name,
            shippingAddress,
            city: totals.shippingCityName,
            shippingCost: totals.shippingCost,
            items: saleCart.map(i => ({ productId: i.productId, productName: i.name, quantity: i.quantity, price: i.price, costPrice: i.costPrice })),
            subtotal: totals.subtotal,
            total: totals.finalTotal,
            profit: totals.profit,
            commission: { percentage: commission, amount: totals.commissionAmount },
            status: paymentMethod === 'full' ? 'Completado' : 'Pendiente',
            amountPaid: paymentMethod === 'full' ? totals.finalTotal : 0,
            payments: paymentMethod === 'full' ? [{ amount: totals.finalTotal, date: Timestamp.now(), method: 'full' }] : [],
            userId: customer.id,
        };

        try {
            await addSale(newSale);
            showToast("¡Venta registrada con éxito!", 'success');
            resetSaleForm();
        } catch(error) {
            console.error("Error al registrar venta:", error);
            showToast(`Error al registrar la venta: ${error.message}`, 'error');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <h3 className="font-bold mb-4">1. Vendedor y Cliente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Vendedor</label>
                            {user.role === 'admin' ? (
                                <Select value={sellerId} onChange={e => setSellerId(e.target.value)}>
                                    {data.users.filter(u => u.role === 'seller' || u.role === 'admin').map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}
                                </Select>
                            ) : (<Input value={user.name} disabled />)}
                        </div>
                        <div>
                            <label className="text-sm font-medium">Cliente</label>
                            <div className="relative">
                                <Input type="text" placeholder="Buscar cliente por nombre o email..." value={customerSearchTerm} onChange={e => setCustomerSearchTerm(e.target.value)} className="mb-2"/>
                                <Select value={selectedCustomerId} onChange={e => handleCustomerChange(e.target.value)} size={filteredCustomers.length > 5 ? 5 : Math.max(2, filteredCustomers.length + 1)}>
                                    <option value="" disabled>-- Seleccionar Cliente --</option>
                                    <option value="__new__">++ Registrar Nuevo Cliente ++</option>
                                    {filteredCustomers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email || 'Sin email'})</option>)}
                                </Select>
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <label className="text-sm font-medium">Dirección de Envío</label>
                            <Select value={shippingCityId} onChange={e => setShippingCityId(e.target.value)}>
                                <option value="" disabled>-- Seleccionar Ciudad --</option>
                                {data.shipping_locations.map(loc => <option key={loc.id} value={loc.id}>{loc.city}</option>)}
                            </Select>
                            <Input placeholder="Dirección completa" value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} />
                        </div>
                    </div>
                </Card>
                <Card>
                    <h3 className="font-bold mb-4">2. Productos</h3>
                    <div className="relative w-full mb-4">
                        <Input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10"/>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2 bg-muted rounded-lg">
                        {displayableProducts.map(p => (
                            <div key={p.id} onClick={() => handleProductSelect(p)} className="bg-card rounded-lg p-2 cursor-pointer hover:shadow-lg transition-shadow text-center">
                                <img src={p.imageUrls?.[0]} alt={p.name} className="w-full h-24 object-contain rounded mb-2"/>
                                <p className="text-xs font-semibold truncate">{p.name}</p>
                                <p className="text-xs text-muted-foreground">Stock: {p.quantity}</p>
                                <p className="text-xs font-bold text-primary">{formatCurrency(p.promoPrice || p.salePrice)}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card className="sticky top-24 space-y-4">
                    <h3 className="font-bold">Resumen de Venta</h3>
                    <div>
                        <label className="text-sm font-medium">Fecha de Venta</label>
                        <Input type="date" value={saleDate} max={new Date().toISOString().split('T')[0]} onChange={e => setSaleDate(e.target.value)} />
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                        {saleCart.map(item => (
                            <div key={item.productId} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                                <div className="flex-1"><p className="font-semibold truncate text-xs">{item.name}</p><p className="text-xs text-muted-foreground">{`${item.quantity} x ${formatCurrency(item.price)}`}</p></div>
                                <div className="flex items-center gap-1">
                                    <Input type="number" value={item.quantity} onChange={e => handleCartQuantityChange(item.productId, e.target.value)} className="w-12 h-8 text-center" />
                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleRemoveFromCart(item.productId)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4 pt-4 border-t border-border">
                        <h4 className="font-semibold">Pagos y Comisión</h4>
                        <Select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}><option value="full">Pago Completo</option><option value="partial">Pago Pendiente</option></Select>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium whitespace-nowrap">Comisión (%):</label>
                            <Input type="number" value={commission} onChange={e => setCommission(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))} />
                        </div>
                        <div className="text-sm text-center bg-muted p-2 rounded-md"><span className="font-semibold">Ganancia Neta: {formatCurrency(totals.profit)}</span> | <span className="font-semibold">Comisión: {formatCurrency(totals.commissionAmount)}</span></div>
                    </div>
                    <div className="space-y-1 text-sm pt-4 border-t border-border">
                        <div className="flex justify-between"><span>Subtotal:</span> <span>{formatCurrency(totals.subtotal)}</span></div>
                        <div className="flex justify-between"><span>Envío:</span> <span>{formatCurrency(totals.shippingCost)}</span></div>
                        <hr/>
                        <div className="flex justify-between text-lg font-bold text-primary"><span>Total a Pagar:</span> <span>{formatCurrency(totals.finalTotal)}</span></div>
                    </div>
                    <Button className="w-full mt-4" onClick={handleCompleteSale} disabled={saleCart.length === 0}>Registrar Venta</Button>
                </Card>
            </div>
            {isNewCustomerModalOpen && <NewCustomerModal isOpen={isNewCustomerModalOpen} onClose={() => setIsNewCustomerModalOpen(false)} onSave={(newCustomerId) => setSelectedCustomerId(newCustomerId)} />}
        </div>
    );
}
