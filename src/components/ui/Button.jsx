import React from 'react';

const Button = ({ children, onClick, className = '', variant = 'primary', size = 'md', ...props }) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
    const variantClasses = { 
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90', 
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90', 
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90', 
        ghost: 'hover:bg-accent hover:text-accent-foreground', 
        link: 'text-primary underline-offset-4 hover:underline' 
    };
    const sizeClasses = { 
        md: 'px-4 py-2', 
        sm: 'h-9 px-3', 
        icon: 'h-10 w-10' 
    };
    return <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>{children}</button>;
};

export default Button;
