import React, { useMemo } from 'react';
// ¡CORRECCIÓN #1! Ahora importamos el hook desde su archivo de contexto correcto.
import { useData } from '../../contexts/DataContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, BarChart3, ShoppingCart, Percent, Users, Package } from 'lucide-react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/shared/StatCard';
import { formatCurrency } from '../../utils/helpers';

export default function AdminDashboardView() {
    const { data } = useData();

    const stats = useMemo(() => {
        // ¡CORRECCIÓN #2! Añadimos "redes de seguridad" (|| []) para evitar errores si los datos aún no han llegado.
        const allSales = [...(data?.sales || []), ...(data?.unregistered_purchases || [])];
        const totalRevenue = allSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const totalProfit = (data?.sales || []).reduce((sum, sale) => sum + (sale.profit || 0), 0);
        const totalCommissions = (data?.sales || []).reduce((sum, sale) => sum + (sale.commission?.amount || 0), 0);
        const totalStock = (data?.products || []).reduce((sum, p) => sum + (p.quantity || 0), 0);
        return { 
            totalRevenue, 
            totalProfit, 
            totalSales: allSales.length, 
            commissionsToPay: totalCommissions, 
            totalCustomers: (data?.customers || []).length, 
            totalStock 
        };
    }, [data]);

    const monthlyRevenueData = useMemo(() => {
        if (!data?.sales || !data?.unregistered_purchases) return [];
        const months = Array(12).fill(0).map((_, i) => ({ name: new Date(0, i).toLocaleString('es-ES', { month: 'short' }), Ingresos: 0 }));
        
        [...data.sales, ...data.unregistered_purchases].forEach(sale => {
            if (sale.date && sale.date instanceof Date) {
                months[sale.date.getMonth()].Ingresos += sale.total;
            }
        });
        return months;
    }, [data]);

    const salesByCategoryData = useMemo(() => {
        if (!data?.sales || !data?.unregistered_purchases || !data?.products) return [];
        const categoryMap = {};
        [...data.sales, ...data.unregistered_purchases].forEach(sale => {
            (sale.items || []).forEach(item => {
                const product = data.products.find(p => p.id === item.productId);
                if (product && product.category) {
                    categoryMap[product.category] = (categoryMap[product.category] || 0) + item.quantity;
                }
            });
        });
        return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    }, [data]);
    
    const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899'];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Ingresos Totales" value={formatCurrency(stats.totalRevenue)} icon={<DollarSign />} color="#3b82f6" />
                <StatCard title="Ganancia (Ventas Registradas)" value={formatCurrency(stats.totalProfit)} icon={<BarChart3 />} color="#10b981" />
                <StatCard title="Órdenes Totales" value={stats.totalSales} icon={<ShoppingCart />} color="#f97316" />
                <StatCard title="Comisiones a Pagar" value={formatCurrency(stats.commissionsToPay)} icon={<Percent />} color="#8b5cf6" />
                <StatCard title="Clientes Registrados (Manual)" value={stats.totalCustomers} icon={<Users />} color="#ec4899" />
                <StatCard title="Artículos en Stock" value={stats.totalStock} icon={<Package />} color="#6366f1" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                    <h3 className="font-semibold mb-4">Ingresos Mensuales (Todas las Órdenes)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={monthlyRevenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                            <YAxis stroke="var(--color-muted-foreground)" tickFormatter={(value) => `L.${value/1000}k`} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }} />
                            <Area type="monotone" dataKey="Ingresos" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="lg:col-span-2">
                    <h3 className="font-semibold mb-4">Ventas por Categoría (Todas las Órdenes)</h3>
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
