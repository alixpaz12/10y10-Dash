import React from 'react';

const Select = ({ children, className = '', ...props }) => (
    <select 
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} 
        {...props}
    >
        {children}
    </select>
);

export default Select;
