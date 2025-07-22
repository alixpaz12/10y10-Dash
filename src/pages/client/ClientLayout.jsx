/*
 * RUTA DEL ARCHIVO: src/pages/client/ClientLayout.jsx
 * DESCRIPCIÓN: Actualizado para incluir el botón de cambio de contraseña.
 */
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppHeader from '../../components/shared/AppHeader';
import Card from '../../components/ui/Card';
import ChangePasswordModal from '../../components/modals/ChangePasswordModal';
import { ShoppingCart, FileText, UserCog, KeyRound, LogOut } from 'lucide-react';

export default function ClientLayout() {
    const { user, logout } = useAuth();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navLinkClasses = "flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors";
    const activeNavLinkClasses = "bg-muted font-semibold";

    return (
        <div className="min-h-screen bg-background font-sans">
            <AppHeader />
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <aside className="md:col-span-1">
                        <Card>
                            <h3 className="font-bold mb-4">Hola, {user?.name}</h3>
                            <nav className="flex flex-col space-y-2">
                                <NavLink to="/client/store" className={({isActive}) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}><ShoppingCart className="h-4 w-4"/> Tienda</NavLink>
                                <NavLink to="/client/purchases" className={({isActive}) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}><FileText className="h-4 w-4"/> Mis Compras</NavLink>
                                <button onClick={() => setIsPasswordModalOpen(true)} className={`${navLinkClasses} w-full text-left`}><KeyRound className="h-4 w-4"/> Cambiar Contraseña</button>
                                <button onClick={handleLogout} className={`${navLinkClasses} w-full text-left`}><LogOut className="h-4 w-4"/> Cerrar Sesión</button>
                            </nav>
                        </Card>
                    </aside>
                    <div className="md:col-span-3"><Outlet /></div>
                </div>
            </main>
            {isPasswordModalOpen && <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />}
        </div>
    );
}