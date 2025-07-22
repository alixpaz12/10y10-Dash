/*
 * RUTA DEL ARCHIVO: src/AppContent.jsx
 * CORRECCIÓN: Se ha eliminado la lógica de redirección automática para
 * evitar el conflicto con las rutas protegidas.
 */
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Global Components
import PublicLayout from './pages/public/PublicLayout';
import ClientLayout from './pages/client/ClientLayout';
import DashboardLayout from './components/shared/DashboardLayout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Spinner from './components/ui/Spinner';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// --- Nav Configs ---
import { Home, ShoppingCart, Package, Users, BarChart3, Settings, FileText, UserPlus, Globe } from 'lucide-react';

const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { id: 'reports', label: 'Reportes', icon: BarChart3, path: '/admin/reports' },
    { id: 'inventory', label: 'Inventario', icon: Package, path: '/admin/inventory' },
    { id: 'sales', label: 'Registrar Venta', icon: ShoppingCart, path: '/admin/sales' },
    { id: 'orders', label: 'Órdenes', icon: FileText, path: '/admin/orders' },
    { id: 'unregistered', label: 'Compras Web', icon: Globe, path: '/admin/unregistered' },
    { id: 'customers', label: 'Registrar Cliente', icon: Users, path: '/admin/customers' },
    { id: 'web-clients', label: 'Clientes Web', icon: Users, path: '/admin/web-clients' },
    { id: 'team', label: 'Equipo', icon: UserPlus, path: '/admin/team' },
    { id: 'settings', label: 'Configuración', icon: Settings, path: '/admin/settings' },
];
const adminPageTitles = Object.fromEntries(adminNavItems.map(item => [item.id, item.label]));

const sellerNavItems = [
    { id: 'dashboard', label: 'Mi Dashboard', icon: Home, path: '/seller/dashboard' },
    { id: 'sales', label: 'Registrar Venta', icon: ShoppingCart, path: '/seller/sales' },
    { id: 'orders', label: 'Mis Órdenes', icon: FileText, path: '/seller/orders' },
    { id: 'customers', label: 'Registrar Cliente', icon: Users, path: '/seller/customers' },
    { id: 'web-clients', label: 'Clientes Web', icon: Globe, path: '/seller/web-clients' },
];
const sellerPageTitles = Object.fromEntries(sellerNavItems.map(item => [item.id, item.label]));

// --- Lazy Load Pages ---
const ProductCatalog = React.lazy(() => import('./pages/public/ProductCatalog'));
const CartView = React.lazy(() => import('./pages/public/CartView'));
const CheckoutView = React.lazy(() => import('./pages/public/CheckoutView'));
const MyPurchasesView = React.lazy(() => import('./pages/client/MyPurchasesView'));
const AdminDashboardView = React.lazy(() => import('./pages/admin/AdminDashboardView'));
const ReportsView = React.lazy(() => import('./pages/admin/ReportsView'));
const InventoryView = React.lazy(() => import('./pages/admin/InventoryView'));
const OrdersView = React.lazy(() => import('./pages/admin/OrdersView'));
const CustomersView = React.lazy(() => import('./pages/admin/CustomersView'));
const TeamView = React.lazy(() => import('./pages/admin/TeamView'));
const SettingsView = React.lazy(() => import('./pages/admin/SettingsView'));
const RegisterSaleView = React.lazy(() => import('./pages/admin/RegisterSaleView'));
const WebClientsView = React.lazy(() => import('./pages/admin/WebClientsView'));
const UnregisteredPurchasesView = React.lazy(() => import('./pages/admin/UnregisteredPurchasesView'));
const SellerDashboardView = React.lazy(() => import('./pages/seller/SellerDashboardView'));

export default function AppContent() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spinner /></div>}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout />}>
                    <Route index element={<ProductCatalog />} />
                    <Route path="cart" element={<CartView />} />
                    <Route path="checkout" element={<CheckoutView />} />
                </Route>

                {/* Client Routes */}
                <Route element={<ProtectedRoute allowedRoles={['client']} />}>
                    <Route path="/client" element={<ClientLayout />}>
                        <Route path="purchases" element={<MyPurchasesView />} />
                        <Route path="store" element={<ProductCatalog />} />
                        <Route index element={<Navigate to="store" replace />} />
                    </Route>
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin" element={<DashboardLayout navItems={adminNavItems} pageTitles={adminPageTitles} />}>
                        <Route path="dashboard" element={<AdminDashboardView />} />
                        <Route path="reports" element={<ReportsView />} />
                        <Route path="inventory" element={<InventoryView />} />
                        <Route path="sales" element={<RegisterSaleView />} />
                        <Route path="orders" element={<OrdersView />} />
                        <Route path="customers" element={<CustomersView />} />
                        <Route path="web-clients" element={<WebClientsView />} />
                        <Route path="unregistered" element={<UnregisteredPurchasesView />} />
                        <Route path="team" element={<TeamView />} />
                        <Route path="settings" element={<SettingsView />} />
                        <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>
                </Route>

                {/* Seller Routes */}
                <Route element={<ProtectedRoute allowedRoles={['seller', 'admin']} />}>
                    <Route path="/seller" element={<DashboardLayout navItems={sellerNavItems} pageTitles={sellerPageTitles} />}>
                        <Route path="dashboard" element={<SellerDashboardView />} />
                        <Route path="sales" element={<RegisterSaleView />} />
                        <Route path="orders" element={<OrdersView />} />
                        <Route path="customers" element={<CustomersView />} />
                        <Route path="web-clients" element={<WebClientsView />} />
                        <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>
                </Route>
                
                {/* Fallback Routes */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}