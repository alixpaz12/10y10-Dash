import React, { useState } from 'react';
import { useData } from '../../hooks/useAppContexts';
import { useNotification } from '../../hooks/useAppContexts';
import { formatCurrency } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

// Componente del formulario de producto
const ProductFormModal = ({ product, onSave, onClose }) => {
    const [formData, setFormData] = useState({ 
        name: product?.name || '', 
        costPrice: product?.costPrice || 0, 
        salePrice: product?.salePrice || 0, 
        promoPrice: product?.promoPrice || '', 
        quantity: product?.quantity || 0, 
        isv: product?.isv ?? true, 
        imageUrls: product?.imageUrls || [''], 
        category: product?.category || 'General', 
        isPublic: product?.isPublic ?? true 
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageUrlChange = (index, value) => {
        const newImageUrls = [...formData.imageUrls];
        newImageUrls[index] = value;
        setFormData(prev => ({ ...prev, imageUrls: newImageUrls }));
    };

    const addImageUrlField = () => setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));

    const removeImageUrlField = (index) => {
        if (formData.imageUrls.length > 1) {
            const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, imageUrls: newImageUrls }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            ...formData, 
            costPrice: parseFloat(formData.costPrice), 
            salePrice: parseFloat(formData.salePrice), 
            promoPrice: formData.promoPrice ? parseFloat(formData.promoPrice) : null, 
            quantity: parseInt(formData.quantity), 
            imageUrls: formData.imageUrls.filter(url => url.trim() !== '') 
        });
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={product ? "Editar Producto" : "Nuevo Producto"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="name" placeholder="Nombre del producto" value={formData.name} onChange={handleChange} required />
                <div className="space-y-2">
                    <label className="text-sm font-medium">URLs de Imágenes</label>
                    {formData.imageUrls.map((url, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input placeholder={`URL de la imagen ${index + 1}`} value={url} onChange={(e) => handleImageUrlChange(index, e.target.value)} required />
                            {formData.imageUrls.length > 1 && (<Button type="button" variant="destructive" size="icon" onClick={() => removeImageUrlField(index)}><Trash2 className="h-4 w-4" /></Button>)}
                        </div>
                    ))}
                    <Button type="button" variant="secondary" onClick={addImageUrlField} className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Añadir otra imagen</Button>
                </div>
                <Input name="category" placeholder="Categoría" value={formData.category} onChange={handleChange} required />
                <div className="grid grid-cols-2 gap-4">
                    <Input name="costPrice" type="number" placeholder="Precio de Costo" value={formData.costPrice} onChange={handleChange} required />
                    <Input name="quantity" type="number" placeholder="Cantidad" value={formData.quantity} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input name="salePrice" type="number" placeholder="Precio de Venta" value={formData.salePrice} onChange={handleChange} required />
                    <Input name="promoPrice" type="number" placeholder="Precio de Promoción (opcional)" value={formData.promoPrice} onChange={handleChange} />
                </div>
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2"><input type="checkbox" name="isv" checked={formData.isv} onChange={handleChange} /><span>Aplica ISV (15%)</span></label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} /><span>Visible en Tienda</span></label>
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </div>
            </form>
        </Modal>
    );
};


export default function InventoryView() {
    const { data, addProduct, updateProduct, deleteProduct } = useData();
    const { showToast } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deletingProductId, setDeletingProductId] = useState(null);

    const openModal = (product = null) => { 
        setEditingProduct(product); 
        setIsModalOpen(true); 
    };
    
    const closeModal = () => { 
        setIsModalOpen(false); 
        setEditingProduct(null); 
    };

    const handleSave = async (productData) => {
        try {
            if (editingProduct) {
                await updateProduct({ ...productData, id: editingProduct.id });
                showToast('Producto actualizado.', 'success');
            } else {
                await addProduct(productData);
                showToast('Producto agregado.', 'success');
            }
            closeModal();
        } catch (error) {
            console.error("Error al guardar producto:", error);
            showToast("Error al guardar el producto.", 'error');
        }
    };

    const handleDelete = async (productId) => {
        try {
            await deleteProduct(productId);
            showToast('Producto eliminado.', 'success');
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            showToast("Error al eliminar el producto.", 'error');
        }
        setDeletingProductId(null);
    };

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Inventario</h2>
                    <Button onClick={() => openModal()}><PlusCircle className="mr-2 h-4 w-4" /> Agregar Producto</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="p-2">Producto</th>
                                <th className="p-2">Precio Costo</th>
                                <th className="p-2">Precio Venta</th>
                                <th className="p-2">Stock</th>
                                <th className="p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.products.map(p => (
                                <tr key={p.id} className="border-b border-border hover:bg-muted">
                                    <td className="p-2 flex items-center gap-2">
                                        <img src={p.imageUrls?.[0]} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                                        <span>{p.name}</span>
                                    </td>
                                    <td className="p-2">{formatCurrency(p.costPrice)}</td>
                                    <td className="p-2">{p.promoPrice ? (<div className="flex items-baseline gap-2"><span className="text-destructive font-bold">{formatCurrency(p.promoPrice)}</span><span className="text-xs line-through text-muted-foreground">{formatCurrency(p.salePrice)}</span></div>) : formatCurrency(p.salePrice)}</td>
                                    <td className="p-2">{p.quantity}</td>
                                    <td className="p-2">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openModal(p)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => setDeletingProductId(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {isModalOpen && <ProductFormModal product={editingProduct} onSave={handleSave} onClose={closeModal} />}
            <ConfirmModal 
                isOpen={!!deletingProductId} 
                onClose={() => setDeletingProductId(null)} 
                onConfirm={() => handleDelete(deletingProductId)} 
                title="Confirmar Eliminación" 
                message="¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer." 
            />
        </>
    );
}
