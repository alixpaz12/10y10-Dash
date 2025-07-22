/*
 * RUTA DEL ARCHIVO: src/components/modals/NewCustomerModal.jsx
 * CORRECCIÓN: Se han ajustado las rutas de importación para los componentes de la UI.
 */
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useNotification } from '../../contexts/NotificationContext';
import { PlusCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

export default function NewCustomerModal({ isOpen, onClose, onSave }) {
    const { data, addCustomer, addShippingLocation } = useData();
    const { showToast } = useNotification();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', city: '', address: '' });
    const [isAddingNewCity, setIsAddingNewCity] = useState(false);
    const [newCityName, setNewCityName] = useState('');
    const [newCityCost, setNewCityCost] = useState('');

    const handleAddNewCity = async () => {
        if (!newCityName || isNaN(parseFloat(newCityCost))) { showToast("Por favor, ingrese un nombre y costo válidos para la ciudad.", 'error'); return; }
        try {
            await addShippingLocation({ city: newCityName, cost: parseFloat(newCityCost) });
            showToast(`Ciudad "${newCityName}" agregada.`, 'success');
            setFormData(prev => ({ ...prev, city: newCityName }));
            setNewCityName(''); setNewCityCost(''); setIsAddingNewCity(false);
        } catch (error) { showToast("Error al agregar la ciudad.", 'error'); console.error(error); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) { showToast("Nombre y Email son requeridos.", "error"); return; }
        try {
            const docRef = await addCustomer(formData);
            showToast("Cliente registrado con éxito.", "success");
            onSave(docRef.id);
            onClose();
        } catch (error) { showToast("Error al registrar cliente.", "error"); console.error("Error adding customer: ", error); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nuevo Cliente">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Nombre Completo" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                <Input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                <Input type="tel" placeholder="Teléfono" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                <Select value={formData.city} onChange={e => { setFormData({ ...formData, city: e.target.value }); setIsAddingNewCity(e.target.value === '__new__'); }}>
                    <option value="" disabled>-- Seleccionar Ciudad --</option>
                    <option value="__new__">++ Agregar Nueva Ciudad ++</option>
                    {data.shipping_locations.map(loc => <option key={loc.id} value={loc.city}>{loc.city}</option>)}
                </Select>
                {isAddingNewCity && (
                    <div className="flex items-center gap-2 p-2 border border-dashed rounded-lg">
                        <Input placeholder="Nombre Ciudad" value={newCityName} onChange={e => setNewCityName(e.target.value)} />
                        <Input type="number" placeholder="Costo Envío" value={newCityCost} onChange={e => setNewCityCost(e.target.value)} />
                        <Button type="button" onClick={handleAddNewCity}><PlusCircle className="h-4 w-4" /></Button>
                    </div>
                )}
                <Input placeholder="Dirección Completa" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Guardar Cliente</Button>
                </div>
            </form>
        </Modal>
    );
}
