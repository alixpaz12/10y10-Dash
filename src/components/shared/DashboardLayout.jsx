/*
 * RUTA DEL ARCHIVO: src/components/shared/DashboardLayout.jsx
 * DESCRIPCIÓN: Actualizado para incluir el modal de cambio de contraseña.
 */
import React, { useState } from 'react';
import { Outlet, Link, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeProvider';
import Button from '../ui/Button';
import ChangePasswordModal from '../modals/ChangePasswordModal';
import { KeyRound, LogOut, Sun, Moon, Menu, Clock } from 'lucide-react';

export default function DashboardLayout({ navItems, pageTitles }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const location = useLocation();
    const currentPath = location.pathname;
    const currentView = navItems.find(item => currentPath.startsWith(item.path))?.id || navItems[0].id;

    return (
        <div className="flex h-screen bg-background text-foreground">
            <aside className={`w-64 bg-card text-card-foreground flex-col p-4 border-r border-border fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0 flex' : '-translate-x-full hidden md:flex'}`}>
                <div className="flex items-center gap-2 mb-8"><Clock className="h-8 w-8 text-primary" /><h1 className="text-xl font-bold">10y10 Panel</h1></div>
                <nav className="flex-grow">
                    <ul>{navItems.map(item => (<li key={item.id}><NavLink to={item.path} onClick={() => setIsSidebarOpen(false)} className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-muted' : 'hover:bg-muted/50'}`}><item.icon className="h-5 w-5" /><span>{item.label}</span></NavLink></li>))}</ul>
                </nav>
                <div className="mt-auto">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setIsPasswordModalOpen(true)}>
                        <KeyRound className="mr-2 h-4 w-4"/> Cambiar Contraseña
                    </Button>
                </div>
            </aside>
            {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
            <div className="flex-1 flex flex-col w-full overflow-x-hidden">
                <header className="bg-card text-card-foreground shadow-md p-4 flex justify-between items-center sticky top-0 z-30">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}><Menu className="h-6 w-6" /></Button>
                    <h2 className="text-xl font-semibold hidden md:block">{pageTitles[currentView] || 'Panel'}</h2>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={toggleTheme}>{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</Button>
                        <span>Hola, {user.name}</span>
                        <Button variant="secondary" onClick={logout}><LogOut className="h-4 w-4 md:mr-2" /><span className="hidden md:inline">Cerrar Sesión</span></Button>
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-6 overflow-y-auto"><Outlet /></main>
            </div>
            {isPasswordModalOpen && <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />}
        </div>
    );
}