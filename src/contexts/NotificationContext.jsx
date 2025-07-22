import React, { useState, createContext, useContext } from 'react';
import ToastContainer from '../components/ui/ToastContainer';

export const NotificationContext = createContext(null);

// Exportamos el hook desde aquí
export const useNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    
    const showToast = (message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(current => current.filter(n => n.id !== id));
        }, 4000);
    };

    return (
        <NotificationContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer notifications={notifications} />
        </NotificationContext.Provider>
    );
}
