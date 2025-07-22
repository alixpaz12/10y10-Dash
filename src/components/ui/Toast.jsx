import React from 'react';
import { Info, CheckCircle, XCircle } from 'lucide-react';

const Toast = ({ message, type }) => {
    const icons = {
        info: <Info className="text-blue-500" />,
        success: <CheckCircle className="text-green-500" />,
        error: <XCircle className="text-red-500" />,
    };
    const baseClasses = "flex items-center gap-3 p-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in-up ";
    const typeClasses = {
        info: "bg-blue-500/10 border border-blue-500/20 text-foreground",
        success: "bg-green-500/10 border border-green-500/20 text-foreground",
        error: "bg-red-500/10 border border-red-500/20 text-foreground",
    };
    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            {icons[type]}
            <span>{message}</span>
        </div>
    );
};

export default Toast;
