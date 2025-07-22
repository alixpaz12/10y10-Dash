/*
 * RUTA DEL ARCHIVO: src/components/modals/ModifyOrderModal.jsx
 * CORRECCIÓN: Se han ajustado las rutas de importación para los componentes de la UI.
 */
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useNotification } from '../../contexts/NotificationContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import LoadingOverlay from '../ui/LoadingOverlay';

export default function ModifyOrderModal({ isOpen, onClose, sale }) {
    const { data, updateSaleDetails } = useData();
    const { showToast } = useNotification();
    const [formData, setFormData] = useState({ customerId: sale.customerId, sellerId: sale.sellerId, commissionPercentage: sale.commission?.percentage || 50, amountPaid: sale.amountPaid || 0, });
    const [loading, setLoading] = useState(false);
    const allCustomers = useMemo(() => {
        const customersMap = new Map();
        data.users.filter(u => u.role === 'client').forEach(u => customersMap.set(u.id, { id: u.id, name: u.name, type: 'web' }));
        data.customers.forEach(c => { if (!customersMap.has(c.id)) { customersMap.set(c.id, { id: c.id, name: c.name, type: 'manual' }); } });
        return Array.from(customersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [data.customers, data.users]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const customer = allCustomers.find(c => c.id === formData.customerId);
            const seller = data.users.find(u => u.id === formData.sellerId);
            const updates = { ...formData, customerName: customer.name, sellerName: seller.name, };
            await updateSaleDetails(sale.id, updates);
            showToast("Venta actualizada con éxito.", "success");
            onClose();
        } catch (error) { console.error("Error al actualizar la venta:", error); showToast(`Error: ${error.message}`, 'error'); } 
        finally { setLoading(false); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Modificar Venta #${sale.id.substring(0, 6)}`}>
            <div className="space-y-4 relative">
                {loading && <LoadingOverlay />}
                <div><label className="text-sm font-medium">Cliente</label><Select value={formData.customerId} onChange={e => setFormData(p => ({ ...p, customerId: e.target.value }))}>{allCustomers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}</Select></div>
                <div><label className="text-sm font-medium">Vendedor</label><Select value={formData.sellerId} onChange={e => setFormData(p => ({ ...p, sellerId: e.target.value }))}>{data.users.filter(u => u.role === 'seller' || u.role === 'admin').map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}</Select></div>
                <div><label className="text-sm font-medium">Comisión (%)</label><Input type="number" value={formData.commissionPercentage} onChange={e => setFormData(p => ({ ...p, commissionPercentage: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) }))} /></div>
                <div><label className="text-sm font-medium">Monto Pagado</label><Input type="number" value={formData.amountPaid} onChange={e => setFormData(p => ({ ...p, amountPaid: parseFloat(e.target.value) || 0 }))} /></div>
                <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={handleSave}>Guardar Cambios</Button></div>
            </div>
        </Modal>
    );
}