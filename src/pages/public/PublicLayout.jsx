/*
 * RUTA DEL ARCHIVO: src/pages/public/PublicLayout.jsx
 * DESCRIPCIÓN: Actualizado para usar el nuevo componente AppHeader.
 */
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from '../../components/shared/AppHeader';
import LoginModal from '../../components/modals/LoginModal';

export default function PublicLayout() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    return (
        <div className="min-h-screen bg-background font-sans">
            <AppHeader onLoginClick={() => setIsLoginModalOpen(true)} />
            <main className="container mx-auto px-4 py-8"><Outlet /></main>
            {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />}
        </div>
    );
}