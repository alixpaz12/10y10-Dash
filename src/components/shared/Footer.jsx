// src/components/shared/Footer.jsx
import React from 'react';

/**
 * Componente de pie de página genérico.
 * Puedes expandirlo con más contenido, enlaces, etc.
 */
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <p>&copy; {new Date().getFullYear()} 10y10 Watch Store. Todos los derechos reservados.</p>
      <p className="text-sm mt-2">Desarrollado con ❤️ y FUTURA</p>
    </footer>
  );
}
