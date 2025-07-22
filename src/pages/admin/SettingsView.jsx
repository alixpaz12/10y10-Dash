import React, { useState, useEffect } from 'react'; // CORRECCIÓN: Se añaden los hooks que faltaban.
import { useData } from '../../contexts/DataContext';
import { useNotification } from '../../contexts/NotificationContext';
import { formatCurrency } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

// Componentes de formulario que se usan solo aquí
const LocationFormModal = ({ isOpen, onClose, onSave, location }) => {
    const [formData, setFormData] = useState({ city: location?.city || '', cost: location?.cost || 0 });
    const handleSubmit = (e) => { e.preventDefault(); onSave({ ...formData, cost: parseFloat(formData.cost) }); };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={location ? 'Editar Ciudad' : 'Agregar Ciudad'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Nombre de la ciudad" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
                <Input type="number" placeholder="Costo de envío" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </div>
            </form>
        </Modal>
    );
};

const DiscountCodeFormModal = ({ isOpen, onClose, onSave, code }) => {
    const toInputDate = (date) => date ? new Date(date).toISOString().split('T')[0] : '';
    const [formData, setFormData] = useState({ 
        id: code?.id || '', 
        percentage: code?.percentage || 0, 
        startDate: toInputDate(code?.startDate), 
        endDate: toInputDate(code?.endDate) 
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const startDate = new Date(formData.startDate + 'T00:00:00');
        const endDate = new Date(formData.endDate + 'T23:59:59');
        onSave({ 
            id: formData.id.toUpperCase(), 
            percentage: parseInt(formData.percentage), 
            startDate: Timestamp.fromDate(startDate), 
            endDate: Timestamp.fromDate(endDate) 
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={code ? 'Editar Código' : 'Agregar Código'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Código (ej: VERANO25)" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} required disabled={!!code} />
                <Input type="number" placeholder="% de descuento" value={formData.percentage} onChange={e => setFormData({...formData, percentage: e.target.value})} required />
                <Input type="date" placeholder="Fecha de inicio" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
                <Input type="date" placeholder="Fecha de fin" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </div>
            </form>
        </Modal>
    );
};


export default function SettingsView() {
    const { data, updateSettings, addShippingLocation, updateShippingLocation, deleteShippingLocation, addDiscountCode, updateDiscountCode, deleteDiscountCode } = useData();
    const { showToast } = useNotification();
    const [settings, setSettings] = useState(data.settings);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [editingCode, setEditingCode] = useState(null);
    const [deletingCodeId, setDeletingCodeId] = useState(null);
    const [deletingLocationId, setDeletingLocationId] = useState(null);

    useEffect(() => { setSettings(data.settings); }, [data.settings]);

    const handleSaveSettings = async () => {
        try {
            await updateSettings(settings);
            showToast('Configuración guardada.', 'success');
        } catch (error) {
            showToast('Error al guardar la configuración.', 'error');
        }
    };

    const handleSaveLocation = async (locationData) => {
        try {
            if (editingLocation) {
                await updateShippingLocation(editingLocation.id, locationData);
                showToast('Ciudad actualizada.', 'success');
            } else {
                await addShippingLocation(locationData);
                showToast('Ciudad agregada.', 'success');
            }
            setIsLocationModalOpen(false);
            setEditingLocation(null);
        } catch (error) {
            showToast('Error al guardar la ciudad.', 'error');
        }
    };

    const handleDeleteLocation = async (locationId) => {
        try {
            await deleteShippingLocation(locationId);
            showToast('Ciudad eliminada.', 'success');
        } catch (error) {
            showToast('Error al eliminar la ciudad.', 'error');
        }
        setDeletingLocationId(null);
    };

    const handleSaveCode = async (codeData) => {
        try {
            if (editingCode) {
                await updateDiscountCode(editingCode.id, codeData);
                showToast('Código actualizado.', 'success');
            } else {
                await addDiscountCode(codeData);
                showToast('Código agregado.', 'success');
            }
            setIsCodeModalOpen(false);
            setEditingCode(null);
        } catch (error) {
            showToast('Error al guardar el código.', 'error');
        }
    };

    const handleDeleteCode = async () => {
        try {
            await deleteDiscountCode(deletingCodeId);
            showToast('Código de descuento eliminado.', 'success');
        } catch(error) {
            showToast('Error al eliminar el código.', 'error');
        }
        setDeletingCodeId(null);
    };

    return (
        <>
            <div className="space-y-6">
                <Card>
                    <h2 className="text-2xl font-bold mb-4">Configuración General</h2>
                    <div className="space-y-4">
                        <Input name="companyName" placeholder="Nombre de la Empresa" value={settings?.companyName || ''} onChange={(e) => setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))} />
                        <Input name="slogan" placeholder="Eslogan" value={settings?.slogan || ''} onChange={(e) => setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))} />
                        <Input name="logoUrl" placeholder="URL del Logo" value={settings?.logoUrl || ''} onChange={(e) => setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))} />
                        <Input name="whatsappNumber" placeholder="Número de WhatsApp (ej: 504...)" value={settings?.whatsappNumber || ''} onChange={(e) => setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))} />
                        <Input name="paypalLink" placeholder="Enlace de PayPal.me" value={settings?.paypalLink || ''} onChange={(e) => setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))} />
                        <Input name="paymentLink" placeholder="Otro enlace de pago" value={settings?.paymentLink || ''} onChange={(e) => setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))} />
                    </div>
                    <Button onClick={handleSaveSettings} className="mt-4">Guardar Configuración</Button>
                </Card>
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Ciudades de Envío</h3>
                            <Button onClick={() => { setEditingLocation(null); setIsLocationModalOpen(true); }}><PlusCircle className="h-4 w-4 mr-2" /> Agregar</Button>
                        </div>
                        <ul className="space-y-2">
                            {(data.shipping_locations || []).map(loc => (
                                <li key={loc.id} className="flex justify-between items-center p-2 bg-muted rounded">
                                    <span>{loc.city} - {formatCurrency(loc.cost)}</span>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingLocation(loc); setIsLocationModalOpen(true); }}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDeletingLocationId(loc.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Códigos de Descuento</h3>
                            <Button onClick={() => { setEditingCode(null); setIsCodeModalOpen(true); }}><PlusCircle className="h-4 w-4 mr-2" /> Agregar</Button>
                        </div>
                        <ul className="space-y-2">
                            {(data.discount_codes || []).map(code => (
                                <li key={code.id} className="flex justify-between items-center p-2 bg-muted rounded">
                                    <div>
                                        <p className="font-semibold">{code.id} ({code.percentage}%)</p>
                                        <p className="text-xs text-muted-foreground">{code.startDate.toLocaleDateString()} - {code.endDate.toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingCode(code); setIsCodeModalOpen(true); }}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDeletingCodeId(code.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
            {isLocationModalOpen && <LocationFormModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} onSave={handleSaveLocation} location={editingLocation} />}
            {isCodeModalOpen && <DiscountCodeFormModal isOpen={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)} onSave={handleSaveCode} code={editingCode} />}
            <ConfirmModal isOpen={!!deletingLocationId} onClose={() => setDeletingLocationId(null)} onConfirm={() => handleDeleteLocation(deletingLocationId)} title="Confirmar Eliminación" message="¿Estás seguro de que quieres eliminar esta ciudad?" />
            <ConfirmModal isOpen={!!deletingCodeId} onClose={() => setDeletingCodeId(null)} onConfirm={handleDeleteCode} title="Confirmar Eliminación" message="¿Estás seguro de que quieres eliminar este código de descuento?" />
        </>
    );
}
