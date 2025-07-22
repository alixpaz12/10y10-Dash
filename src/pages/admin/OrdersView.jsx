/*
 * RUTA DEL ARCHIVO: src/pages/admin/OrdersView.jsx
 * CORRECCIÓN: Se ha ajustado el manejo de fechas para el ordenamiento.
 */
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNotification } from '../../contexts/NotificationContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { Wallet, Edit, Trash2, RefreshCw } from 'lucide-react';
import ManageOrderModal from '../../components/modals/ManageOrderModal';
import ModifyOrderModal from '../../components/modals/ModifyOrderModal';
import ConvertPurchaseModal from '../../components/modals/ConvertPurchaseModal';
import InvoicePDFGenerator from '../../components/pdf/InvoicePDFGenerator';

const formatCurrency = (amount) => `L. ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function OrdersView() {
    const { user } = useAuth();
    const { data, deleteSale, deleteUnregisteredPurchase } = useData();
    const { showToast } = useNotification();
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [deletingSale, setDeletingSale] = useState(null);
    const [finalDeleteConfirm, setFinalDeleteConfirm] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const allOrders = useMemo(() => {
        const registeredSales = data.sales.map(s => ({ ...s, type: 'registered' }));
        const unregisteredPurchases = data.unregistered_purchases.map(p => ({ ...p, type: 'unregistered', sellerName: p.sellerName || 'Tienda Web 10y10', amountPaid: 0, commission: { amount: 0 } }));
        // CORRECCIÓN: No se llama a .toDate() porque la fecha ya es un objeto Date de JS.
        return [...registeredSales, ...unregisteredPurchases].sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
    }, [data.sales, data.unregistered_purchases]);

    const filteredSales = useMemo(() => {
        if (filterType === 'all') return allOrders;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return allOrders.filter(sale => {
            if (!sale.date) return false;
            // La fecha ya es un objeto Date
            const saleDate = sale.date;
            if (filterType === 'today') return saleDate >= startOfToday;
            if (filterType === 'month') return saleDate >= startOfMonth;
            if (filterType === 'custom' && customStartDate && customEndDate) {
                const start = new Date(customStartDate); start.setHours(0, 0, 0, 0);
                const end = new Date(customEndDate); end.setHours(23, 59, 59, 999);
                return saleDate >= start && saleDate <= end;
            }
            return false;
        });
    }, [allOrders, filterType, customStartDate, customEndDate]);

    const openManageModal = (sale) => { setSelectedSale(sale); setIsManageModalOpen(true); };
    const openModifyModal = (sale) => { setSelectedSale(sale); setIsModifyModalOpen(true); };
    const openConvertModal = (sale) => { setSelectedSale(sale); setIsConvertModalOpen(true); };
    const closeModal = () => { setSelectedSale(null); setIsManageModalOpen(false); setIsModifyModalOpen(false); setIsConvertModalOpen(false); };
    const handleDeleteClick = (sale) => { if (sale.type === 'registered' && (sale.status === 'Abonado' || sale.status === 'Completado')) { setDeletingSale(sale); } else { setFinalDeleteConfirm(sale); } };
    const handleDelete = async (sale) => {
        try {
            if (sale.type === 'registered') { await deleteSale(sale.id); showToast('Venta eliminada y stock restaurado.', 'success'); }
            else { await deleteUnregisteredPurchase(sale.id); showToast('Compra no registrada eliminada.', 'success'); }
        } catch (error) { console.error("Error al eliminar la orden:", error); showToast(`Error al eliminar: ${error.message}`, 'error'); }
        setFinalDeleteConfirm(null); setDeletingSale(null);
    };
    const getStatusClass = (status) => {
        switch (status) {
            case 'Completado': return 'bg-green-500/20 text-green-500';
            case 'Pendiente': return 'bg-yellow-500/20 text-yellow-500';
            case 'Abonado': return 'bg-blue-500/20 text-blue-500';
            case 'Cancelado': return 'bg-red-500/20 text-red-500';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <>
            <Card>
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold">Historial de Órdenes</h2>
                    <div className="flex flex-wrap items-center gap-2"><Button onClick={() => setFilterType('all')} variant={filterType === 'all' ? 'primary' : 'secondary'}>Todos</Button><Button onClick={() => setFilterType('today')} variant={filterType === 'today' ? 'primary' : 'secondary'}>Hoy</Button><Button onClick={() => setFilterType('month')} variant={filterType === 'month' ? 'primary' : 'secondary'}>Este Mes</Button><Button onClick={() => setFilterType('custom')} variant={filterType === 'custom' ? 'primary' : 'secondary'}>Personalizado</Button>{filterType === 'custom' && (<div className="flex gap-2"><Input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} /><Input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} /></div>)}</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead><tr className="border-b border-border"><th className="p-2">Fecha y Hora</th><th className="p-2">Cliente</th><th className="p-2">Vendedor</th><th className="p-2">Total</th><th className="p-2">Pagado</th><th className="p-2">Saldo</th><th className="p-2">Estado</th><th className="p-2">Acciones</th></tr></thead>
                        <tbody>
                            {filteredSales.map(sale => {
                                const balance = sale.total - (sale.amountPaid || 0) - (sale.extraDiscount || 0);
                                const isUnregistered = sale.type === 'unregistered';
                                return (
                                <tr key={sale.id} className="border-b border-border hover:bg-muted">
                                    <td className="p-2">{sale.date ? sale.date.toLocaleString('es-HN') : 'N/A'}</td><td className="p-2">{sale.customerName}</td><td className="p-2">{sale.sellerName || 'N/A'}</td><td className="p-2 font-semibold">{formatCurrency(sale.total)}</td><td className="p-2 text-green-500">{formatCurrency(sale.amountPaid)}</td><td className="p-2 text-red-500">{formatCurrency(balance)}</td><td className="p-2"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(sale.status)}`}>{sale.status}</span></td>
                                    <td className="p-2"><div className="flex gap-1">{user.role === 'admin' ? (<><Button variant="ghost" size="sm" onClick={() => isUnregistered ? openConvertModal(sale) : openManageModal(sale)}>{isUnregistered ? <RefreshCw className="h-4 w-4 text-blue-500"/> : <Wallet className="h-4 w-4"/>}</Button><Button variant="ghost" size="sm" onClick={() => openModifyModal(sale)} disabled={isUnregistered}><Edit className="h-4 w-4"/></Button><InvoicePDFGenerator sale={sale} /><Button variant="ghost" size="icon" onClick={() => handleDeleteClick(sale)}><Trash2 className="h-4 w-4 text-destructive" /></Button></>) : (<InvoicePDFGenerator sale={sale} />)}</div></td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </Card>
            {selectedSale && isManageModalOpen && <ManageOrderModal isOpen={isManageModalOpen} onClose={closeModal} sale={selectedSale} />}
            {selectedSale && isModifyModalOpen && <ModifyOrderModal isOpen={isModifyModalOpen} onClose={closeModal} sale={selectedSale} />}
            {selectedSale && isConvertModalOpen && <ConvertPurchaseModal isOpen={isConvertModalOpen} onClose={closeModal} purchase={selectedSale} />}
            <ConfirmModal isOpen={!!deletingSale} onClose={() => setDeletingSale(null)} onConfirm={() => { setFinalDeleteConfirm(deletingSale); setDeletingSale(null); }} title="Confirmar Eliminación" message={`Esta venta tiene pagos registrados. Eliminarla restaurará el stock y la quitará de los reportes. ¿Estás seguro de que quieres eliminar la venta #${deletingSale?.id.substring(0, 6)}?`} />
            <ConfirmModal isOpen={!!finalDeleteConfirm} onClose={() => setFinalDeleteConfirm(null)} onConfirm={() => handleDelete(finalDeleteConfirm)} title="¡ADVERTENCIA FINAL!" message={`Esta acción es irreversible y alterará permanentemente los informes y el inventario. ¿Estás absolutamente seguro de eliminar la orden #${finalDeleteConfirm?.id.substring(0, 6)}?`} />
        </>
    );
}