import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useNotification } from '../../contexts/NotificationContext';
import { formatCurrency } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/shared/StatCard';
import { CheckCircle, Wallet, Clock, Package, BadgePercent, FileSpreadsheet } from 'lucide-react';

// This modal is used within ReportsView, so we keep it here for simplicity.
const ExportCSVModal = ({ isOpen, onClose, columns, onConfirm }) => {
    const [selectedKeys, setSelectedKeys] = useState(() => columns.map(c => c.key));

    const handleToggle = (key) => {
        setSelectedKeys(prev => 
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const handleConfirm = () => {
        if (selectedKeys.length > 0) {
            onConfirm(selectedKeys);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Exportar a CSV">
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Selecciona las columnas que deseas incluir en el reporte.</p>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                    {columns.map(col => (
                        <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={selectedKeys.includes(col.key)} 
                                onChange={() => handleToggle(col.key)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium">{col.label}</span>
                        </label>
                    ))}
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleConfirm} disabled={selectedKeys.length === 0}>Exportar</Button>
                </div>
            </div>
        </Modal>
    );
};


export default function ReportsView() {
    const { data } = useData();
    const { showToast } = useNotification();
    const [filterType, setFilterType] = useState('month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    useEffect(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfToday = new Date();
        setCustomStartDate(startOfMonth.toISOString().split('T')[0]);
        setCustomEndDate(endOfToday.toISOString().split('T')[0]);
    }, []);

    const [isSellerExportModalOpen, setIsSellerExportModalOpen] = useState(false);
    const [isSalesExportModalOpen, setIsSalesExportModalOpen] = useState(false);

    const sellerExportColumns = useMemo(() => [{ key: 'name', label: 'Vendedor' }, { key: 'productsSold', label: 'Productos Vendidos' }, { key: 'totalValue', label: 'Valor Total de Ventas' }, { key: 'totalCommission', label: 'Comisión Ganada' }], []);
    const salesExportColumns = useMemo(() => [{ key: 'fechaVenta', label: 'Fecha y Hora de Venta' }, { key: 'nombreCliente', label: 'Nombre del Cliente' }, { key: 'nombreVendedor', label: 'Nombre del Vendedor' }, { key: 'nombreProducto', label: 'Nombre del Producto' }, { key: 'cantidad', label: 'Cantidad' }, { key: 'precioUnitario', label: 'Precio Unitario' }, { key: 'precioTotal', label: 'Precio Total' }, { key: 'precioPromocion', label: 'Precio de Promoción' }, { key: 'descuentoPromocion', label: 'Descuento por Promoción' }, { key: 'codigoDescuento', label: 'Código de Descuento' }, { key: 'valorCodigo', label: 'Valor del Código' }, { key: 'descuentoExtra', label: 'Descuento Extra' }, { key: 'totalPagado', label: 'Total Pagado' }, { key: 'ganancia', label: 'Ganancia' }, { key: 'comisionValor', label: 'Comisión (Valor)' }, { key: 'comisionPorcentaje', label: 'Comisión (%)' }], []);

    const filteredSales = useMemo(() => {
        const sales = data?.sales || [];
        if (filterType === 'all') return sales;
        
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return sales.filter(sale => {
            if (!sale.date || !(sale.date instanceof Date)) return false;
            
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
    }, [data, filterType, customStartDate, customEndDate]);

    const reportData = useMemo(() => {
        const statusCounts = filteredSales.reduce((acc, sale) => { acc[sale.status] = (acc[sale.status] || 0) + 1; return acc; }, {});
        const totalStock = (data?.products || []).reduce((sum, p) => sum + p.quantity, 0);
        const productsOnPromo = (data?.products || []).filter(p => p.promoPrice).length;
        
        const sellerPerformance = (data?.users || []).filter(u => u.role === 'seller' || u.role === 'admin').map(seller => {
            const salesBySeller = filteredSales.filter(s => s.sellerId === seller.id);
            return { 
                id: seller.id, 
                name: seller.name, 
                totalValue: salesBySeller.reduce((sum, s) => sum + s.total, 0), 
                totalCommission: salesBySeller.reduce((sum, s) => sum + (s.commission?.amount || 0), 0), 
                productsSold: salesBySeller.reduce((sum, s) => sum + s.items.reduce((itemSum, i) => itemSum + i.quantity, 0), 0) 
            };
        }).sort((a, b) => b.totalValue - a.totalValue);

        return { 
            completado: statusCounts['Completado'] || 0, 
            abonado: statusCounts['Abonado'] || 0, 
            pendiente: statusCounts['Pendiente'] || 0, 
            totalStock, 
            productsOnPromo, 
            sellerPerformance 
        };
    }, [filteredSales, data]);

    const detailedSalesData = useMemo(() => {
        return filteredSales.filter(sale => sale.status === 'Completado').flatMap(sale => {
            const saleSubtotal = sale.subtotal > 0 ? sale.subtotal : 1;
            const saleProfit = sale.profit > 0 ? sale.profit : 1;
            return sale.items.map(item => {
                const product = (data?.products || []).find(p => p.id === item.productId);
                if (!product) return null;
                
                const itemValueBasedOnSalePrice = product.salePrice * item.quantity;
                const itemTotalSoldAt = item.price * item.quantity;
                const isPromo = product.promoPrice && product.promoPrice === item.price;
                const promoDiscountValue = isPromo ? (product.salePrice - product.promoPrice) * item.quantity : 0;
                const codeDiscountValue = (sale.discount?.amount || 0) * (itemTotalSoldAt / saleSubtotal);
                const extraDiscountValue = (sale.extraDiscount || 0) * (itemTotalSoldAt / saleSubtotal);
                const itemTotalPaid = itemTotalSoldAt - codeDiscountValue - extraDiscountValue;
                const itemCost = (product.costPrice || 0) * item.quantity;
                const itemProfit = itemTotalPaid - itemCost;
                const itemCommissionAmount = (sale.commission?.amount || 0) * (itemProfit / saleProfit);

                return { 
                    fechaVenta: sale.date.toLocaleString('es-HN'), 
                    nombreCliente: sale.customerName, 
                    nombreVendedor: sale.sellerName || 'N/A', 
                    nombreProducto: item.productName, 
                    cantidad: item.quantity, 
                    precioUnitario: formatCurrency(product.salePrice), 
                    precioPromocion: isPromo ? formatCurrency(product.promoPrice) : 'N/A', 
                    precioTotal: formatCurrency(itemValueBasedOnSalePrice), 
                    descuentoPromocion: formatCurrency(promoDiscountValue), 
                    codigoDescuento: sale.discount?.code || 'N/A', 
                    valorCodigo: formatCurrency(codeDiscountValue), 
                    descuentoExtra: formatCurrency(extraDiscountValue), 
                    totalPagado: formatCurrency(itemTotalPaid), 
                    ganancia: formatCurrency(itemProfit), 
                    comisionValor: formatCurrency(itemCommissionAmount), 
                    comisionPorcentaje: `${sale.commission?.percentage || 0}%` 
                };
            });
        }).filter(Boolean);
    }, [filteredSales, data]);

    const handleConfirmExportCSV = (selectedKeys, dataToExport, columns, fileName) => {
        const formattedData = dataToExport.map(row => {
            const newRow = {};
            selectedKeys.forEach(key => { newRow[columns.find(c => c.key === key).label] = row[key]; });
            return newRow;
        });
        if (window.Papa) {
            const csv = window.Papa.unparse(formattedData);
            const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName}_${customStartDate}_a_${customEndDate}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            showToast("La librería de exportación no está disponible.", "error");
        }
    };

    return (
        <>
            <div className="space-y-6">
                <Card>
                    <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                        <h2 className="text-2xl font-bold">Generador de Reportes</h2>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button onClick={() => setFilterType('all')} variant={filterType === 'all' ? 'primary' : 'secondary'}>Todos</Button>
                            <Button onClick={() => setFilterType('today')} variant={filterType === 'today' ? 'primary' : 'secondary'}>Hoy</Button>
                            <Button onClick={() => setFilterType('month')} variant={filterType === 'month' ? 'primary' : 'secondary'}>Este Mes</Button>
                            <Button onClick={() => setFilterType('custom')} variant={filterType === 'custom' ? 'primary' : 'secondary'}>Personalizado</Button>
                            {filterType === 'custom' && (<div className="flex gap-2"><Input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} /><Input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} /></div>)}
                        </div>
                    </div>
                </Card>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <StatCard title="Pedidos Completados" value={reportData.completado} icon={<CheckCircle />} color="#10b981" />
                    <StatCard title="Pedidos en Abono" value={reportData.abonado} icon={<Wallet />} color="#8b5cf6" />
                    <StatCard title="Pedidos Pendientes" value={reportData.pendiente} icon={<Clock />} color="#ec4899" />
                    <StatCard title="Productos en Stock" value={reportData.totalStock} icon={<Package />} color="#6366f1" />
                    <StatCard title="Productos en Promoción" value={reportData.productsOnPromo} icon={<BadgePercent />} color="#3b82f6" />
                </div>
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Ranking de Vendedores</h3>
                        <Button onClick={() => setIsSellerExportModalOpen(true)} variant="secondary"><FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar a Excel</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead><tr className="border-b border-border"><th className="p-2">#</th><th className="p-2">Vendedor</th><th className="p-2 text-right">Productos Vendidos</th><th className="p-2 text-right">Valor Total de Ventas</th><th className="p-2 text-right">Comisión Ganada</th></tr></thead>
                            <tbody>{reportData.sellerPerformance.map((seller, index) => (<tr key={seller.id} className="border-b border-border hover:bg-muted"><td className="p-2 font-bold">{index + 1}</td><td className="p-2">{seller.name}</td><td className="p-2 text-right">{seller.productsSold}</td><td className="p-2 text-right font-semibold">{formatCurrency(seller.totalValue)}</td><td className="p-2 text-right text-green-500">{formatCurrency(seller.totalCommission)}</td></tr>))}</tbody>
                        </table>
                    </div>
                </Card>
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Reporte Detallado de Ventas Completadas</h3>
                        <Button onClick={() => setIsSalesExportModalOpen(true)} variant="secondary"><FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar a Excel</Button>
                    </div>
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 bg-card"><tr className="border-b border-border">{salesExportColumns.map(col => <th key={col.key} className="p-2">{col.label}</th>)}</tr></thead>
                            <tbody>{detailedSalesData.map((row, index) => (<tr key={index} className="border-b border-border hover:bg-muted">{salesExportColumns.map(col => <td key={col.key} className="p-2">{row[col.key]}</td>)}</tr>))}</tbody>
                        </table>
                    </div>
                </Card>
            </div>
            {isSellerExportModalOpen && <ExportCSVModal isOpen={isSellerExportModalOpen} onClose={() => setIsSellerExportModalOpen(false)} columns={sellerExportColumns} onConfirm={(keys) => handleConfirmExportCSV(keys, reportData.sellerPerformance, sellerExportColumns, 'ranking_vendedores')} />}
            {isSalesExportModalOpen && <ExportCSVModal isOpen={isSalesExportModalOpen} onClose={() => setIsSalesExportModalOpen(false)} columns={salesExportColumns} onConfirm={(keys) => handleConfirmExportCSV(keys, detailedSalesData, salesExportColumns, 'ventas_detalladas')} />}
        </>
    );
}
