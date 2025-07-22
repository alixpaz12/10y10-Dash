/*
 * RUTA DEL ARCHIVO: src/components/modals/ConvertPurchaseModal.jsx
 * CORRECCIÓN: Se ha añadido lógica para pre-seleccionar vendedor y cliente.
 */
import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useNotification } from '../../contexts/NotificationContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card from '../ui/Card';
import LoadingOverlay from '../ui/LoadingOverlay';
import NewCustomerModal from './NewCustomerModal';

const formatCurrency = (amount) => `L. ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ConvertPurchaseModal({ isOpen, onClose, purchase }) {
    const { convertPurchaseToSale, data } = useData();
    const { showToast } = useNotification();
    const [isLoading, setIsLoading] = useState(false);
    const [sellerId, setSellerId] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [commission, setCommission] = useState(50);
    const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Lógica para pre-seleccionar vendedor (tienda)
            const storeAdmin = data.users.find(u => u.name === 'Store de 10y10' || u.role === 'admin');
            if (storeAdmin) {
                setSellerId(storeAdmin.id);
            }

            // Lógica para pre-seleccionar cliente si ya existe por email
            if (purchase.customerEmail) {
                const existingCustomer = data.customers.find(c => c.email && c.email.toLowerCase() === purchase.customerEmail.toLowerCase());
                if (existingCustomer) {
                    setCustomerId(existingCustomer.id);
                    showToast(`Cliente existente '${existingCustomer.name}' encontrado y seleccionado.`, 'info');
                }
            }
        }
    }, [isOpen, data.users, data.customers, purchase.customerEmail, showToast]);


    const handleConvert = async () => {
        if (!sellerId || !customerId) { showToast("Debe seleccionar un vendedor y un cliente.", "error"); return; }
        setIsLoading(true);
        const saleDetails = { sellerId, customerId, commissionPercentage: commission };
        try {
            await convertPurchaseToSale(purchase, saleDetails);
            showToast("Orden convertida a venta con éxito.", "success");
            onClose();
        } catch (error) { console.error("Error al convertir la compra:", error); showToast(`Error: ${error.message}`, 'error'); } 
        finally { setIsLoading(false); }
    };

    const handleCustomerSelection = (id) => { if (id === '__new__') { setIsNewCustomerModalOpen(true); } else { setCustomerId(id); } };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={`Convertir Pedido Web #${purchase.id.substring(0, 6)}`}>
                <div className="space-y-4 relative">
                    {isLoading && <LoadingOverlay />}
                    <p className="text-muted-foreground">Asigna un vendedor y un cliente a este pedido para gestionarlo como una venta formal.</p>
                    <Card><h4 className="font-semibold mb-2">Detalles del Pedido</h4><p><strong>Cliente Original:</strong> {purchase.customerName}</p><p><strong>Dirección:</strong> {purchase.shippingAddress}</p><p><strong>Total:</strong> {formatCurrency(purchase.total)}</p></Card>
                    <div><label className="text-sm font-medium">Asignar Vendedor</label><Select value={sellerId} onChange={e => setSellerId(e.target.value)}><option value="" disabled>-- Seleccionar Vendedor --</option>{data.users.filter(u => u.role === 'seller' || u.role === 'admin').map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}</Select></div>
                    <div><label className="text-sm font-medium">Asignar Cliente</label><Select value={customerId} onChange={e => handleCustomerSelection(e.target.value)}><option value="" disabled>-- Seleccionar Cliente --</option><option value="__new__">++ Registrar Nuevo Cliente ++</option>{data.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></div>
                    <div><label className="text-sm font-medium">Comisión del Vendedor (%)</label><Input type="number" value={commission} onChange={e => setCommission(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))} /></div>
                    <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancelar</Button><Button onClick={handleConvert} disabled={isLoading}>Convertir a Venta</Button></div>
                </div>
            </Modal>
            {isNewCustomerModalOpen && (<NewCustomerModal isOpen={isNewCustomerModalOpen} onClose={() => setIsNewCustomerModalOpen(false)} onSave={(newId) => { setCustomerId(newId); setIsNewCustomerModalOpen(false); }} />)}
        </>
    );
}