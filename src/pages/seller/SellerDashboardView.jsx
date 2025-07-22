import React, { useMemo } from 'react';
import { useData } from '../../hooks/useAppContexts';
import { useAuth } from '../../hooks/useAppContexts';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DollarSign, Percent, Package } from 'lucide-react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/shared/StatCard';
import { formatCurrency } from '../../utils/helpers';

export default function SellerDashboardView() {
    const { data } = useData();
    const { user } = useAuth();
    const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899'];

    const sellerSales = useMemo(() => data.sales.filter(s => s.sellerId === user.uid), [data.sales, user.uid]);

    const stats = useMemo(() => {
        const totalSales = sellerSales.reduce((sum, s) => sum + s.total, 0);
        const totalCommissions = sellerSales.reduce((sum, s) => sum + (s.commission?.amount || 0), 0);
        const productsSoldCount = sellerSales.reduce((sum, s) => sum + s.items.reduce((q, i) => q + i.quantity, 0), 0);
        return { totalSales, totalCommissions, productsSoldCount };
    }, [sellerSales]);

    const monthlySalesData = useMemo(() => {
        const months = Array(12).fill(0).map((_, i) => ({ name: new Date(0, i).toLocaleString('es-ES', { month: 'short' }), Ventas: 0 }));
        sellerSales.forEach(sale => {
            // CORRECCIÓN: Nos aseguramos que 'sale.date' es un objeto Date válido antes de usarlo.
            if (sale.date && sale.date instanceof Date) {
                months[sale.date.getMonth()].Ventas += sale.total;
            }
        });
        return months;
    }, [sellerSales]);

    const salesByCategoryData = useMemo(() => {
        const categoryMap = {};
        sellerSales.forEach(sale => {
            sale.items.forEach(item => {
                const product = data.products.find(p => p.id === item.productId);
                if (product) {
                    categoryMap[product.category] = (categoryMap[product.category] || 0) + item.quantity;
                }
            });
        });
        return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    }, [sellerSales, data.products]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Mi Dashboard de Vendedor</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Mis Ventas Totales" value={formatCurrency(stats.totalSales)} icon={<DollarSign />} color="#3b82f6" />
                <StatCard title="Mis Comisiones Ganadas" value={formatCurrency(stats.totalCommissions)} icon={<Percent />} color="#10b981" />
                <StatCard title="Productos Vendidos por mí" value={stats.productsSoldCount} icon={<Package />} color="#f97316" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                    <h3 className="font-semibold mb-4">Mis Ventas Mensuales</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlySalesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                            <YAxis stroke="var(--color-muted-foreground)" tickFormatter={(value) => `L.${value/1000}k`} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }} />
                            <Bar dataKey="Ventas" fill="#6366f1" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="lg:col-span-2">
                    <h3 className="font-semibold mb-4">Mis Ventas por Categoría</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={salesByCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {salesByCategoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
}