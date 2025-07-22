// src/components/client/ProfileForm.jsx
import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input'; // Asumiendo que tienes un componente Input genérico
import Spinner from '../ui/Spinner'; // Asegúrate de importar Spinner

/**
 * Formulario para editar la información personal del cliente.
 * @param {object} initialData - Datos iniciales del perfil.
 * @param {function} onSubmit - Función a llamar al enviar el formulario.
 * @param {function} onCancel - Función a llamar al cancelar la edición.
 * @param {boolean} isLoading - Indica si la operación está en curso.
 */
export default function ProfileForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' })); // Limpiar error al cambiar
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido.';
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre Completo
        </label>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Tu nombre completo"
          className="mt-1 block w-full"
          error={errors.name}
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <Input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tu@email.com"
          className="mt-1 block w-full"
          error={errors.email}
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <Input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Ej: +1234567890"
          className="mt-1 block w-full"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Nueva Contraseña (opcional)
        </label>
        <Input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Deja en blanco para no cambiar"
          className="mt-1 block w-full"
          error={errors.password}
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirmar Nueva Contraseña
        </label>
        <Input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Repite la nueva contraseña"
          className="mt-1 block w-full"
          error={errors.confirmPassword}
        />
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <Button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800"
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white"
          disabled={isLoading}
        >
          {isLoading ? <Spinner size="small" /> : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}
