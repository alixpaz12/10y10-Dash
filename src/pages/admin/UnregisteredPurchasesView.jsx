import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useAppContexts';
import { useNotification } from '../../hooks/useAppContexts';
import { formatCurrency } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { Edit, Trash2 } from 'lucide-react';

const EditUnregisteredPurchaseModal = ({ purchase, onSave, onClose }) => {
    const { updateUnregisteredPurchase } = useData();
    const { showToast } = useNotification();
    const [formData, setFormData] = useState({
        customerName: purchase?.customerName || '',
        customerEmail: purchase?.customerEmail || '',
        phone: purchase?.phone || '',
        shippingAddress: purchase?.shippingAddress || '',
        city: purchase?.city || '',
    });

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateUnregisteredPurchase(purchase.id, formData);
            showToast('Compra actualizada.', 'success');
            onSave();
        } catch (error) {
            showToast('Error al actualizar.', 'error');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Editar Compra Web">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="customerName" placeholder="Nombre del Cliente" value={formData.customerName} onChange={handleChange} required />
                <Input name="phone" placeholder="Teléfono" value={formData.phone} onChange={handleChange} />
                <Input name="city" placeholder="Ciudad" value={formData.city} onChange={handleChange} />
                <Input name="shippingAddress" placeholder="Dirección" value={formData.shippingAddress} onChange={handleChange} />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Guardar Cambios</Button>
                </div>
            </form>
        </Modal>
    );
};

export default function UnregisteredPurchasesView() {
    const { data, deleteUnregisteredPurchase } = useData();
    const { showToast } = useNotification();
    const [editingPurchase, setEditingPurchase] = useState(null);
    const [deletingPurchaseId, setDeletingPurchaseId] = useState(null);

    const sortedPurchases = useMemo(() => {
        return [...data.unregistered_purchases].sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
    }, [data.unregistered_purchases]);

    const handleSave = () => {
        setEditingPurchase(null);
    };

    const handleDelete = async (purchaseId) => {
        try {
            await deleteUnregisteredPurchase(purchaseId);
            showToast('Compra eliminada.', 'success');
        } catch (error) {
            showToast("Error al eliminar la compra.", 'error');
        }
        setDeletingPurchaseId(null);
    };

    return (
        <>
            <Card>
                <h2 className="text-2xl font-bold mb-4">Compras de Clientes no Registrados</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="p-2">Fecha</th><th className="p-2">Cliente</th><th className="p-2">Email</th><th className="p-2">Teléfono</th><th className="p-2">Dirección</th><th className="p-2">Total</th><th className="p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPurchases.map(p => (
                                <tr key={p.id} className="border-b border-border hover:bg-muted">
                                    <td className="p-2">{p.date?.toLocaleDateString() || 'N/A'}</td>
                                    <td className="p-2">{p.customerName}</td>
                                    <td className="p-2">{p.customerEmail}</td>
                                    <td className="p-2">{p.phone}</td>
                                    <td className="p-2">{p.shippingAddress}, {p.city}</td>
                                    <td className="p-2">{formatCurrency(p.total)}</td>
                                    <td className="p-2">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setEditingPurchase(p)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => setDeletingPurchaseId(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {editingPurchase && <EditUnregisteredPurchaseModal purchase={editingPurchase} onSave={handleSave} onClose={() => setEditingPurchase(null)} />}
            <ConfirmModal isOpen={!!deletingPurchaseId} onClose={() => setDeletingPurchaseId(null)} onConfirm={() => handleDelete(deletingPurchaseId)} title="Confirmar Eliminación" message="¿Seguro que quieres eliminar esta compra? Esta acción es irreversible." />
        </>
    );
}