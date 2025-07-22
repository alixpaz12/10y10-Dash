/*
 * RUTA DEL ARCHIVO: src/components/modals/LoginModal.jsx
 * DESCRIPCIÓN: Corregido para importar 'auth' y 'db' desde firebase.js
 * y para redirigir correctamente después del login.
 */
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import LoadingOverlay from '../ui/LoadingOverlay';
import { auth, db } from '../../services/firebase'; // Importación necesaria
import { doc, getDoc } from 'firebase/firestore'; // Importación necesaria

export default function LoginModal({ isOpen, onClose }) {
    const { login, register } = useAuth();
    const { data } = useData();
    const { showToast } = useNotification();
    const navigate = useNavigate();

    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        if (result.success) {
            onClose();
            const homePath = result.role === 'admin' ? '/admin' : result.role === 'seller' ? '/seller' : '/client';
            navigate(homePath);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if(!city) { showToast("Por favor, seleccione una ciudad.", 'error'); return; }
        setLoading(true);
        const success = await register(name, email, password, phone, city);
        setLoading(false);
        if (success) {
            onClose();
            navigate('/client');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}>
            <div className="relative">
                {loading && <LoadingOverlay />}
                {isRegistering ? (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <Input placeholder="Nombre Completo" type="text" value={name} onChange={e => setName(e.target.value)} required />
                        <Input placeholder="Correo Electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <Input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <Input placeholder="Número de Teléfono" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
                        <Select value={city} onChange={e => setCity(e.target.value)} required>
                            <option value="" disabled>Seleccione su ciudad</option>
                            {data.shipping_locations.map(loc => (<option key={loc.id} value={loc.city}>{loc.city}</option>))}
                        </Select>
                        <Button type="submit" className="w-full" disabled={loading}>Registrarse</Button>
                        <p className="text-sm text-center">¿Ya tienes cuenta? <Button type="button" variant="link" onClick={() => setIsRegistering(false)}>Inicia sesión</Button></p>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input placeholder="Correo Electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <Input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <Button type="submit" className="w-full" disabled={loading}>Acceder</Button>
                        <p className="text-sm text-center">¿No tienes cuenta? <Button type="button" variant="link" onClick={() => setIsRegistering(true)}>Regístrate</Button></p>
                    </form>
                )}
            </div>
        </Modal>
    );
}