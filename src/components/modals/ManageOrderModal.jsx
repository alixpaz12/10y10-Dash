/*
 * RUTA DEL ARCHIVO: src/components/modals/ManageOrderModal.jsx
 * CORRECCIÓN: Se han ajustado las rutas de importación para los componentes de la UI.
 */
import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Timestamp, arrayUnion } from 'firebase/firestore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const formatCurrency = (amount) => `L. ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ManageOrderModal({ isOpen, onClose, sale }) {
    const { data, updateSale } = useData();
    const { showToast } = useNotification();
    const [paymentType, setPaymentType] = useState('partial');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [installments, setInstallments] = useState(1);
    const [sellerId, setSellerId] = useState(sale.sellerId || '');
    const [commission, setCommission] = useState(sale.commission?.percentage || 50);
    const amountPaid = sale.amountPaid || 0;
    const extraDiscount = sale.extraDiscount || 0;
    const balanceDue = sale.total - amountPaid - extraDiscount;

    useEffect(() => { if (paymentType === 'full') { setPaymentAmount(balanceDue > 0 ? balanceDue.toFixed(2) : ''); } else { setPaymentAmount(''); } }, [paymentType, balanceDue]);

    const handleSaveChanges = async () => {
        const updates = {};
        const newPaymentAmount = parseFloat(paymentAmount) || 0;
        if (newPaymentAmount < 0) { showToast("Monto de pago inválido.", 'error'); return; }
        if (newPaymentAmount > balanceDue + 0.01) { showToast(`El pago no puede exceder el saldo de ${formatCurrency(balanceDue)}.`, 'error'); return; }
        if (commission !== sale.commission?.percentage || sellerId !== sale.sellerId) { const netProfit = sale.profit || 0; updates.commission = { percentage: commission, amount: (netProfit * commission) / 100 }; }
        if (sellerId !== sale.sellerId) { const newSeller = data.users.find(u => u.id === sellerId); updates.sellerId = sellerId; updates.sellerName = newSeller?.name || 'N/A'; }
        if (newPaymentAmount > 0) { updates.payments = arrayUnion({ amount: newPaymentAmount, date: Timestamp.now(), method: paymentType }); const newTotalPaid = amountPaid + newPaymentAmount; updates.amountPaid = newTotalPaid; updates.status = newTotalPaid >= sale.total ? 'Completado' : 'Abonado'; }
        if (Object.keys(updates).length === 0) { showToast("No se han realizado cambios.", "info"); return; }
        try { await updateSale(sale.id, updates); showToast("Orden actualizada con éxito.", 'success'); onClose(); }
        catch (error) { console.error("Error actualizando la orden:", error); showToast("Error al actualizar la orden.", 'error'); }
    };

    const customerDetails = data.users.find(u => u.id === sale.userId) || data.customers.find(c => c.id === sale.customerId);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Gestionar Pedido #${sale.id.substring(0, 6)}`}>
            <div className="space-y-4">
                <div><h3 className="font-semibold">{sale.customerName}</h3><p className="text-sm text-muted-foreground">Email: {customerDetails?.email}</p><p className="text-sm text-muted-foreground">Teléfono: {customerDetails?.phone}</p><p className="text-sm text-muted-foreground">Dirección: {sale.shippingAddress}</p></div>
                <div className="space-y-2 text-sm p-3 bg-muted rounded-md"><div className="flex justify-between"><span>Total del Pedido:</span> <span className="font-bold">{formatCurrency(sale.total)}</span></div><div className="flex justify-between text-green-500"><span>Total Pagado:</span> <span className="font-bold">{formatCurrency(amountPaid)}</span></div>{extraDiscount > 0 && <div className="flex justify-between text-blue-500"><span>Descuento Extra:</span> <span className="font-bold">-{formatCurrency(extraDiscount)}</span></div>}<div className="flex justify-between text-red-500"><span>Saldo Pendiente:</span> <span className="font-bold">{formatCurrency(balanceDue)}</span></div></div>
                <div className="grid md:grid-cols-2 gap-4"><div><label className="text-sm font-medium">Asignar Vendedor</label><Select value={sellerId} onChange={e => setSellerId(e.target.value)}><option value="">Sin Vendedor</option>{data.users.filter(u => u.role === 'seller' || u.role === 'admin').map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}</Select></div><div><label className="text-sm font-medium">Comisión del Vendedor (%)</label><Input type="number" value={commission} onChange={e => setCommission(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))} /></div></div>
                <div><h4 className="font-semibold mb-2">Registrar Pago</h4><div className="flex gap-4 mb-2"><label className="flex items-center gap-2"><input type="radio" name="paymentType" value="partial" checked={paymentType === 'partial'} onChange={e => setPaymentType(e.target.value)} /> Pago Parcial</label><label className="flex items-center gap-2"><input type="radio" name="paymentType" value="full" checked={paymentType === 'full'} onChange={e => setPaymentType(e.target.value)} /> Pago Completo</label></div>{paymentType === 'partial' && balanceDue > 0 && (<div className="flex items-center gap-2 mb-2"><label className="text-sm">Cuotas:</label><Input type="number" min="1" value={installments} onChange={e => setInstallments(parseInt(e.target.value))} className="w-20" /><label className="text-sm">Monto por cuota:</label><Input value={formatCurrency(balanceDue / installments)} disabled /></div>)}<Input type="number" placeholder="Monto del pago" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} /></div>
                <div className="flex justify-end gap-2 pt-4 border-t border-border"><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={handleSaveChanges}>Guardar Cambios</Button></div>
            </div>
        </Modal>
    );
}