/*
 * RUTA DEL ARCHIVO: src/components/shared/AppHeader.jsx
 * DESCRIPCIÓN: Nuevo componente para la cabecera pública, que ahora incluye
 * un botón para ir al Dashboard si el usuario es admin o seller.
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeProvider';
import { useCart } from '../../contexts/CartContext';
import Button from '../ui/Button';
import { Sun, Moon, ShoppingCart, LogOut, LayoutDashboard } from 'lucide-react';

export default function AppHeader({ onLoginClick }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className="bg-card text-card-foreground shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
            <Link to="/" className="text-2xl font-bold text-primary">10y10 Watch Store</Link>
            <div className="flex items-center gap-2 md:gap-4">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</Button>
                <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {totalCartItems > 0 && <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-card">{totalCartItems}</span>}
                </Button>
                
                {user && ['admin', 'seller'].includes(user.role) && (
                    <Button onClick={() => navigate(`/${user.role}`)} size="sm" variant="secondary">
                        <LayoutDashboard className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Dashboard</span>
                    </Button>
                )}

                {user ? (
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline">Hola, {user.name}</span>
                        <Button variant="secondary" onClick={logout} size="sm"><LogOut className="h-4 w-4 md:mr-2" /><span className="hidden md:inline">Salir</span></Button>
                    </div>
                ) : (<Button onClick={onLoginClick} size="sm">Acceder</Button>)}
            </div>
        </header>
    );
}