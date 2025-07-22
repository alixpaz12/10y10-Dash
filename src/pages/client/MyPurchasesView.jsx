/*
 * RUTA DEL ARCHIVO: src/pages/client/MyPurchasesView.jsx
 * DESCRIPCIÓN: Se ha corregido la ruta de importación de InvoicePDFGenerator
 * y se ha implementado la lógica para mostrar los detalles de las compras.
 */
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import InvoicePDFGenerator from '../../components/pdf/InvoicePDFGenerator'; // Ruta corregida

const formatCurrency = (amount) => `L. ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// --- Modal de Detalles de Compra ---
function PurchaseDetailModal({ sale, onClose }) {
    const { data } = useData();

    return (
        <Modal isOpen={true} onClose={onClose} title={`Detalle del Pedido #${sale.id.substring(0, 6)}`}>
            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold mb-2">Artículos del Pedido</h3>
                    <div className="space-y-2">
                        {sale.items.map((item, index) => {
                            const product = data.products.find(p => p.id === item.productId);
                            const isPromo = product && product.promoPrice && product.promoPrice === item.price;
                            return (
                                <div key={index} className="flex items-center gap-4 p-2 bg-muted rounded-md">
                                    <div className="flex-grow">
                                        <p className="font-semibold">{item.productName}</p>
                                        <p className="text-sm text-muted-foreground">{item.quantity} x {isPromo ? (<><span className="line-through mr-2">{formatCurrency(product.salePrice)}</span><span className="text-destructive font-bold">{formatCurrency(item.price)}</span></>) : formatCurrency(item.price)}</p>
                                    </div>
                                    <p className="font-semibold">{formatCurrency(item.quantity * item.price)}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Resumen Financiero</h3>
                    <div className="space-y-1 text-sm p-3 bg-muted rounded-md">
                        <div className="flex justify-between"><span>Subtotal:</span> <span>{formatCurrency(sale.subtotal)}</span></div>
                        {sale.discount && <div className="flex justify-between text-green-500"><span>Descuento ({sale.discount.code}):</span> <span>-{formatCurrency(sale.discount.amount)}</span></div>}
                        <div className="flex justify-between"><span>Envío:</span> <span>{formatCurrency(sale.shippingCost)}</span></div>
                        <hr className="border-border my-1"/>
                        <div className="flex justify-between font-bold text-base"><span>Total:</span> <span>{formatCurrency(sale.total)}</span></div>
                        <div className="flex justify-between text-green-500"><span>Pagado:</span> <span>{formatCurrency(sale.amountPaid)}</span></div>
                        <div className="flex justify-between text-red-500"><span>Saldo:</span> <span>{formatCurrency(sale.total - (sale.amountPaid || 0))}</span></div>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Dirección de Envío</h3>
                    <div className="p-3 bg-muted rounded-md">
                        <p>{sale.shippingAddress}</p>
                        <p className="text-sm text-muted-foreground">{sale.city}</p>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-border">
                    <InvoicePDFGenerator sale={sale} />
                    <Button variant="secondary" onClick={onClose}>Cerrar</Button>
                </div>
            </div>
        </Modal>
    );
}


// --- Vista Principal de Mis Compras ---
export default function MyPurchasesView() {
    const { data } = useData();
    const [selectedSale, setSelectedSale] = useState(null);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Completado': return 'bg-green-500/20 text-green-500';
            case 'Pendiente': return 'bg-yellow-500/20 text-yellow-500';
            case 'Abonado': return 'bg-blue-500/20 text-blue-500';
            case 'Cancelado': return 'bg-red-500/20 text-red-500';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const sortedSales = useMemo(() => [...data.sales].sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0)), [data.sales]);

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4">Mis Compras</h2>
            <div className="space-y-4">
                {sortedSales.length > 0 ? sortedSales.map(sale => (
                    <div key={sale.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold">Pedido #{sale.id.substring(0, 6)}</p>
                                <p className="text-sm text-muted-foreground">{sale.date.toLocaleDateString()}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(sale.status)}`}>{sale.status}</span>
                        </div>
                        <div className="mt-2 text-right">
                            <span className="font-bold text-lg">{formatCurrency(sale.total)}</span>
                            <Button variant="link" onClick={() => setSelectedSale(sale)}>Ver Detalle</Button>
                        </div>
                    </div>
                )) : (<p>Aún no has realizado ninguna compra.</p>)}
            </div>
            {selectedSale && <PurchaseDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />}
        </Card>
    );
}
