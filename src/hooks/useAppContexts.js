import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { DataContext } from '../contexts/DataContext';
import { ThemeContext } from '../contexts/ThemeProvider'; // <-- ¡Tornillo apretado!
import { CartContext } from '../contexts/CartContext';
import { NotificationContext } from '../contexts/NotificationContext';

// Creamos hooks personalizados para no tener que importar 'useContext' y el contexto en cada archivo.
export const useAuth = () => useContext(AuthContext);
export const useData = () => useContext(DataContext);
export const useTheme = () => useContext(ThemeContext);
export const useCart = () => useContext(CartContext);
export const useNotification = () => useContext(NotificationContext);