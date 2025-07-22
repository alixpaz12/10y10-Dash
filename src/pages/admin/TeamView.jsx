import React, { useState, useMemo } from 'react';
import { useData, useAuth, useNotification } from '../../hooks/useAppContexts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { UserPlus, Edit, Trash2 } from 'lucide-react';

// Formulario para editar un miembro
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

// Formulario para crear un nuevo miembro
const NewTeamMemberModal = ({ onClose }) => {
    const { createTeamMemberByAdmin } = useAuth();
    const { showToast } = useNotification();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'seller' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await createTeamMemberByAdmin(formData.name, formData.email, formData.password, formData.role);
        setLoading(false);
        if (success) {
            onClose();
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Agregar Miembro al Equipo">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="name" placeholder="Nombre Completo" value={formData.name} onChange={handleChange} required />
                <Input name="email" type="email" placeholder="Correo Electrónico" value={formData.email} onChange={handleChange} required />
                <Input name="password" type="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />
                <Select name="role" value={formData.role} onChange={handleChange}>
                    <option value="seller">Vendedor</option>
                    <option value="admin">Administrador</option>
                </Select>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button type="submit" disabled={loading}>Crear Miembro</Button>
                </div>
            </form>
        </Modal>
    );
};


export default function TeamView() {
    const { data, updateUser, deleteUser } = useData();
    const { showToast } = useNotification();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUserId, setDeletingUserId] = useState(null);

    const teamMembers = useMemo(() => data.users.filter(u => u.role === 'admin' || u.role === 'seller'), [data.users]);

    const openEditModal = (user) => { 
        setEditingUser(user); 
        setIsEditModalOpen(true); 
    };
    
    const closeEditModal = () => { 
        setIsEditModalOpen(false); 
        setEditingUser(null); 
    };

    const handleSave = async (userData) => {
        try {
            await updateUser({ ...userData, id: editingUser.id });
            showToast('Usuario actualizado.', 'success');
            closeEditModal();
        } catch (error) {
            console.error("Error actualizando usuario:", error);
            showToast("Error al actualizar usuario.", 'error');
        }
    };

    const handleDelete = async (userId) => {
        try {
            await deleteUser(userId);
            showToast('Usuario eliminado.', 'success');
        } catch (error) {
            console.error("Error eliminando usuario:", error);
            showToast("Error al eliminar usuario.", 'error');
        }
        setDeletingUserId(null);
    };

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Gestión de Equipo</h2>
                    <Button onClick={() => setIsNewModalOpen(true)}><UserPlus className="mr-2 h-4 w-4" /> Agregar Miembro</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="p-2">Nombre</th><th className="p-2">Email</th><th className="p-2">Rol</th><th className="p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamMembers.map(u => (
                                <tr key={u.id} className="border-b border-border hover:bg-muted">
                                    <td className="p-2">{u.name}</td><td className="p-2">{u.email}</td>
                                    <td className="p-2"><span className={`px-2 py-1 rounded-full text-xs ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>{u.role}</span></td>
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
            {isEditModalOpen && <TeamMemberFormModal user={editingUser} onSave={handleSave} onClose={closeEditModal} />}
            {isNewModalOpen && <NewTeamMemberModal onClose={() => setIsNewModalOpen(false)} />}
            <ConfirmModal isOpen={!!deletingUserId} onClose={() => setDeletingUserId(null)} onConfirm={() => handleDelete(deletingUserId)} title="Confirmar Eliminación" message="¿Seguro que quieres eliminar este usuario? Esta acción no se puede deshacer." />
        </>
    );
}