import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useAppContexts';
import { useNotification } from '../../hooks/useAppContexts';
import { formatCurrency } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

// Componente del formulario para reutilizarlo en "Nuevo" y "Editar"
const CustomerFormModal = ({ customer, onSave, onClose }) => {
    const { data, addShippingLocation } = useData();
    const { showToast } = useNotification();
    const [formData, setFormData] = useState({ 
        name: customer?.name || '', 
        email: customer?.email || '', 
        phone: customer?.phone || '', 
        city: customer?.city || '', 
        address: customer?.address || '' 
    });
    const [isAddingNewCity, setIsAddingNewCity] = useState(false);
    const [newCityName, setNewCityName] = useState('');
    const [newCityCost, setNewCityCost] = useState('');

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleAddNewCity = async () => {
        if (!newCityName || isNaN(parseFloat(newCityCost))) {
            showToast("Por favor, ingrese un nombre y costo válidos para la ciudad.", 'error');
            return;
        }
        try {
            await addShippingLocation({ city: newCityName, cost: parseFloat(newCityCost) });
            showToast(`Ciudad "${newCityName}" agregada.`, 'success');
            setFormData(prev => ({ ...prev, city: newCityName }));
            setNewCityName(''); 
            setNewCityCost(''); 
            setIsAddingNewCity(false);
        } catch (error) {
            showToast("Error al agregar la ciudad.", 'error');
            console.error(error);
        }
    };

    const handleSubmit = (e) => { 
        e.preventDefault(); 
        onSave(formData); 
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={customer ? "Editar Cliente" : "Nuevo Cliente"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="name" placeholder="Nombre" value={formData.name} onChange={handleChange} required />
                <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                <Input name="phone" placeholder="Teléfono" value={formData.phone} onChange={handleChange} />
                <Select name="city" value={formData.city} onChange={e => { setFormData({...formData, city: e.target.value}); setIsAddingNewCity(e.target.value === '__new__'); }}>
                    <option value="" disabled>-- Seleccionar Ciudad --</option>
                    <option value="__new__">++ Agregar Nueva Ciudad ++</option>
                    {data.shipping_locations.map(loc => <option key={loc.id} value={loc.city}>{loc.city}</option>)}
                </Select>
                {isAddingNewCity && (
                    <div className="flex items-center gap-2 p-2 border border-dashed rounded-lg">
                        <Input placeholder="Nombre Ciudad" value={newCityName} onChange={e => setNewCityName(e.target.value)} />
                        <Input type="number" placeholder="Costo Envío" value={newCityCost} onChange={e => setNewCityCost(e.target.value)} />
                        <Button type="button" onClick={handleAddNewCity}><PlusCircle className="h-4 w-4"/></Button>
                    </div>
                )}
                <Input name="address" placeholder="Dirección Completa" value={formData.address} onChange={handleChange} />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </div>
            </form>
        </Modal>
    );
};


export default function CustomersView() {
    const { data, addCustomer, updateCustomer, deleteCustomer } = useData();
    const { showToast } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [deletingCustomerId, setDeletingCustomerId] = useState(null);

    const sortedCustomers = useMemo(() => [...data.customers].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)), [data.customers]);

    const openModal = (customer = null) => { 
        setEditingCustomer(customer); 
        setIsModalOpen(true); 
    };
    
    const closeModal = () => { 
        setIsModalOpen(false); 
        setEditingCustomer(null); 
    };

    const handleSave = async (customerData) => {
        try {
            if (editingCustomer) {
                await updateCustomer({ ...customerData, id: editingCustomer.id });
                showToast('Cliente actualizado.', 'success');
            } else {
                await addCustomer(customerData);
                showToast('Cliente agregado.', 'success');
            }
            closeModal();
        } catch (error) {
            console.error("Error guardando cliente:", error);
            showToast("Error al guardar cliente.", 'error');
        }
    };

    const handleDelete = async (customerId) => {
        try {
            await deleteCustomer(customerId);
            showToast('Cliente eliminado.', 'success');
        } catch (error) {
            console.error("Error eliminando cliente:", error);
            showToast("Error al eliminar cliente.", 'error');
        }
        setDeletingCustomerId(null);
    };

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Registrar Cliente</h2>
                    <Button onClick={() => openModal()}><PlusCircle className="mr-2 h-4 w-4" /> Agregar Cliente</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="p-2">Nombre</th>
                                <th className="p-2">Email</th>
                                <th className="p-2">Teléfono</th>
                                <th className="p-2">Ciudad</th>
                                <th className="p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedCustomers.map(c => (
                                <tr key={c.id} className="border-b border-border hover:bg-muted">
                                    <td className="p-2">{c.name}</td>
                                    <td className="p-2">{c.email}</td>
                                    <td className="p-2">{c.phone}</td>
                                    <td className="p-2">{c.city}</td>
                                    <td className="p-2">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openModal(c)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => setDeletingCustomerId(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {isModalOpen && <CustomerFormModal customer={editingCustomer} onSave={handleSave} onClose={closeModal} />}
            <ConfirmModal 
                isOpen={!!deletingCustomerId} 
                onClose={() => setDeletingCustomerId(null)} 
                onConfirm={() => handleDelete(deletingCustomerId)} 
                title="Confirmar Eliminación" 
                message="¿Estás seguro de que quieres eliminar este cliente?" 
            />
        </>
    );
}
