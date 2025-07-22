import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAppContexts';
import { useData } from '../../hooks/useAppContexts';
import { useNotification } from '../../hooks/useAppContexts';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import LoadingOverlay from '../../components/ui/LoadingOverlay';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
    const { login, register } = useAuth();
    const { data } = useData();
    const { showToast } = useNotification();
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(email, password);
        setLoading(false);
        if (success) { 
            if (onSuccess) onSuccess(); 
            onClose(); 
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if(!city) { 
            showToast("Por favor, seleccione una ciudad.", 'error'); 
            return; 
        }
        setLoading(true);
        const success = await register(name, email, password, phone, city);
        setLoading(false);
        if (success) { 
            if (onSuccess) onSuccess(); 
            onClose(); 
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
                        <Input placeholder="Dirección de Envío" type="text" value={address} onChange={e => setAddress(e.target.value)} required />
                        <Button type="submit" className="w-full" disabled={loading}>Registrarse</Button>
                        <p className="text-sm text-center">
                            ¿Ya tienes cuenta? <Button type="button" variant="link" onClick={() => setIsRegistering(false)}>Inicia sesión</Button>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input placeholder="Correo Electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <Input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <Button type="submit" className="w-full" disabled={loading}>Acceder</Button>
                        <p className="text-sm text-center">
                            ¿No tienes cuenta? <Button type="button" variant="link" onClick={() => setIsRegistering(true)}>Regístrate</Button>
                        </p>
                    </form>
                )}
            </div>
        </Modal>
    );
};

export default LoginModal;
