import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useAppContexts';
import { useNotification } from '../../hooks/useAppContexts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { Edit, Trash2 } from 'lucide-react';

// Reutilizamos el formulario de TeamMember, ya que es similar
const TeamMemberFormModal = ({ user, onSave, onClose, isClient = false }) => {
    const [formData, setFormData] = useState({ name: user?.name || '', role: user?.role || 'seller' });
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <Modal isOpen={true} onClose={onClose} title="Editar Miembro del Equipo">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="name" placeholder="Nombre" value={formData.name} onChange={handleChange} required />
                <div>
                    <label className="text-sm font-medium">Rol</label>
                    <Select name="role" value={formData.role} onChange={handleChange} disabled={isClient}>
                        <option value="seller">Vendedor</option>
                        <option value="admin">Admin</option>
                        {isClient && <option value="client">Cliente</option>}
                    </Select>
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Guardar Cambios</Button>
                </div>
            </form>
        </Modal>
    );
};

export default function WebClientsView() {
    const { data, updateUser, deleteUser } = useData();
    const { showToast } = useNotification();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUserId, setDeletingUserId] = useState(null);
    const webClients = useMemo(() => data.users.filter(u => u.role === 'client'), [data.users]);

    const openEditModal = (user) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleSave = async (userData) => {
        try {
            await updateUser({ name: userData.name, id: editingUser.id });
            showToast('Cliente actualizado.', 'success');
            setIsEditModalOpen(false);
        } catch (error) {
            showToast("Error al actualizar cliente.", 'error');
        }
    };

    const handleDelete = async (userId) => {
        try {
            await deleteUser(userId);
            showToast('Cliente eliminado.', 'success');
        } catch (error) {
            showToast("Error al eliminar cliente.", 'error');
        }
        setDeletingUserId(null);
    };

    return (
        <>
            <Card>
                <h2 className="text-2xl font-bold mb-4">Clientes Registrados en la Web</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="p-2">Nombre</th><th className="p-2">Email</th><th className="p-2">ID de Usuario</th><th className="p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {webClients.map(u => (
                                <tr key={u.id} className="border-b border-border hover:bg-muted">
                                    <td className="p-2">{u.name}</td><td className="p-2">{u.email}</td><td className="p-2 text-xs text-muted-foreground">{u.id}</td>
                                    <td className="p-2">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openEditModal(u)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => setDeletingUserId(u.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {isEditModalOpen && <TeamMemberFormModal user={editingUser} onSave={handleSave} onClose={() => setIsEditModalOpen(false)} isClient={true} />}
            <ConfirmModal isOpen={!!deletingUserId} onClose={() => setDeletingUserId(null)} onConfirm={() => handleDelete(deletingUserId)} title="Confirmar Eliminación" message="¿Seguro que quieres eliminar este cliente web? Esta acción es irreversible." />
        </>
    );
}
