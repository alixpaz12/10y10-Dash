/*
 * RUTA DEL ARCHIVO: src/contexts/ThemeProvider.jsx
 * DESCRIPCIÓN: Se ha añadido la exportación de 'ThemeContext' para solucionar
 * el error de importación que causaba la pantalla en blanco.
 */
import React, { useState, useEffect, createContext, useContext } from 'react';

// CORRECCIÓN: Se exporta el ThemeContext directamente.
export const ThemeContext = createContext(null);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    
    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
