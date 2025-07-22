import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-6xl font-bold">404</h1>
            <p className="text-muted-foreground mt-2">Página no encontrada.</p>
            <Link to="/"><Button className="mt-6">Volver al Inicio</Button></Link>
        </div>
    );
};

export default NotFound;
