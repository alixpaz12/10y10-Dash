export const formatCurrency = (amount) => `L. ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const getStatusClass = (status) => {
    switch (status) {
        case 'Completado': return 'bg-green-500/20 text-green-500';
        case 'Pendiente': return 'bg-yellow-500/20 text-yellow-500';
        case 'Abonado': return 'bg-blue-500/20 text-blue-500';
        case 'Cancelado': return 'bg-red-500/20 text-red-500';
        default: return 'bg-muted text-muted-foreground';
    }
};
