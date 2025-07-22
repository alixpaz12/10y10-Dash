import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const Unauthorized = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <XCircle className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-4xl font-bold">Acceso Denegado</h1>
            <p className="text-muted-foreground mt-2">No tienes permiso para ver esta página.</p>
            <Button onClick={() => navigate(-1)} className="mt-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
            </Button>
        </div>
    );
};

export default Unauthorized;
