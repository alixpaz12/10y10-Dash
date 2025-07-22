import React from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-lg m-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4"/></Button>
                </div>
                <div className="p-4 max-h-[80vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
