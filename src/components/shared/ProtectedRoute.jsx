import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAppContexts';
import Spinner from '../ui/Spinner';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isAuthLoading } = useAuth();
    const location = useLocation();

    if (isAuthLoading) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
