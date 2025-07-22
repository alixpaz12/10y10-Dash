import React from 'react';
import Toast from './Toast';

const ToastContainer = ({ notifications }) => {
    return (
        <div className="fixed bottom-4 right-4 z-[100] w-80 space-y-2">
            {notifications.map(({ id, message, type }) => (
                <Toast key={id} message={message} type={type} />
            ))}
        </div>
    );
};

export default ToastContainer;
