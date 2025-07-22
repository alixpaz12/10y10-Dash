// src/App.jsx
import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers - CORRECCIÓN: Rutas de importación ajustadas a los nombres de archivo correctos.
import { ThemeProvider } from './contexts/ThemeProvider';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { CartProvider } from './contexts/CartContext';

// Layouts & Global Components
import PublicLayout from './pages/public/PublicLayout';
import ClientLayout from './pages/client/ClientLayout';
import DashboardLayout from './components/shared/DashboardLayout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Spinner from './components/ui/Spinner';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import AppContent from './AppContent';

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
const ProductCatalog = lazy(() => import('./pages/public/ProductCatalog'));
const CartView = lazy(() => import('./pages/public/CartView'));
const CheckoutView = lazy(() => import('./pages/public/CheckoutView'));
const MyPurchasesView = lazy(() => import('./pages/client/MyPurchasesView'));
const AdminDashboardView = lazy(() => import('./pages/admin/AdminDashboardView'));
const ReportsView = lazy(() => import('./pages/admin/ReportsView'));
const InventoryView = lazy(() => import('./pages/admin/InventoryView'));
const OrdersView = lazy(() => import('./pages/admin/OrdersView'));
const CustomersView = lazy(() => import('./pages/admin/CustomersView'));
const TeamView = lazy(() => import('./pages/admin/TeamView'));
const SettingsView = lazy(() => import('./pages/admin/SettingsView'));
const RegisterSaleView = lazy(() => import('./pages/admin/RegisterSaleView'));
const WebClientsView = lazy(() => import('./pages/admin/WebClientsView'));
const UnregisteredPurchasesView = lazy(() => import('./pages/admin/UnregisteredPurchasesView'));
const SellerDashboardView = lazy(() => import('./pages/seller/SellerDashboardView'));
// NUEVO: Importación lazy para la vista de perfil del cliente
const ClientProfileView = lazy(() => import('./pages/client/ClientProfileView'));

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <DataProvider>
            <CartProvider>
              <HashRouter>
                <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spinner /></div>}>
                  <AppContent>
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
                          {/* NUEVA RUTA PARA EL PERFIL DEL CLIENTE */}
                          <Route path="profile" element={<ClientProfileView />} />
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
                  </AppContent>
                </Suspense>
              </HashRouter>
            </CartProvider>
          </DataProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
