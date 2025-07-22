import React from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmVariant = 'destructive' }) => {
    if (!isOpen) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button variant={confirmVariant} onClick={() => { onConfirm(); onClose(); }}>Confirmar</Button>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
