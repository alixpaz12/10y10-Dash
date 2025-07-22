/*
 * RUTA DEL ARCHIVO: src/components/modals/ChangePasswordModal.jsx
 * DESCRIPCIÓN: Nuevo componente para el modal de cambio de contraseña.
 */
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingOverlay from '../ui/LoadingOverlay';

export default function ChangePasswordModal({ isOpen, onClose }) {
    const { changePassword } = useAuth();
    const { showToast } = useNotification();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast("Las nuevas contraseñas no coinciden.", "error");
            return;
        }
        if (newPassword.length < 6) {
            showToast("La nueva contraseña debe tener al menos 6 caracteres.", "error");
            return;
        }
        setLoading(true);
        const success = await changePassword(currentPassword, newPassword);
        setLoading(false);
        if (success) {
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cambiar Contraseña">
            <form onSubmit={handleSubmit} className="space-y-4 relative">
                {loading && <LoadingOverlay />}
                <Input type="password" placeholder="Contraseña Actual" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                <Input type="password" placeholder="Nueva Contraseña" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                <Input type="password" placeholder="Confirmar Nueva Contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={loading}>Actualizar Contraseña</Button>
                </div>
            </form>
        </Modal>
    );
}