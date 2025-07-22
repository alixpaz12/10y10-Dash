// src/components/client/AddressList.jsx
import React from 'react';
import Button from '../ui/Button';
import { Edit, Trash2 } from 'lucide-react';
import Spinner from '../ui/Spinner';

/**
 * Lista de direcciones guardadas del cliente.
 * @param {Array} addresses - Array de objetos de dirección.
 * @param {function} onEdit - Función a llamar al editar una dirección.
 * @param {function} onDelete - Función a llamar al eliminar una dirección.
 * @param {boolean} isLoading - Indica si la operación está en curso.
 */
export default function AddressList({ addresses, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <p className="text-gray-600">No tienes direcciones guardadas aún.</p>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div
          key={address.id}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-lg shadow-sm bg-white"
        >
          <div className="flex-grow mb-2 sm:mb-0">
            <p className="font-semibold text-gray-800 text-lg">{address.alias}</p>
            <p className="text-gray-600">{address.street}</p>
            <p className="text-gray-600">{`${address.city}, ${address.state} ${address.zipCode}`}</p>
            <p className="text-gray-600">{address.country}</p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => onEdit(address)}
              className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full"
              aria-label="Editar dirección"
            >
              <Edit size={18} />
            </Button>
            <Button
              onClick={() => onDelete(address.id)}
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
              aria-label="Eliminar dirección"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
