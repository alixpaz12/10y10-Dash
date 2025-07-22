/*
 * RUTA DEL ARCHIVO: src/pages/public/ProductCatalog.jsx
 * DESCRIPCIÓN: NUEVO ARCHIVO. Este componente se encarga de mostrar
 * el catálogo de productos en la tienda pública.
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import ProductCard from '../../components/shared/ProductCard';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Search } from 'lucide-react';

export default function ProductCatalog() {
    const { data, loading } = useData();
    const [sortedProducts, setSortedProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = useMemo(() => {
        if (!data.products) return ['all'];
        const availableProducts = data.products.filter(p => p.isPublic && p.quantity > 0);
        return ['all', ...Array.from(new Set(availableProducts.map(p => p.category)))];
    }, [data.products]);

    useEffect(() => {
        if (data.products) {
            const availableProducts = data.products.filter(p => p.isPublic && p.quantity > 0);
            const searchedProducts = availableProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
            const categorizedProducts = selectedCategory === 'all' ? searchedProducts : searchedProducts.filter(p => p.category === selectedCategory);
            
            const sorted = categorizedProducts.sort((a, b) => {
                const aIsOnSale = !!a.promoPrice;
                const bIsOnSale = !!b.promoPrice;
                if (aIsOnSale !== bIsOnSale) return aIsOnSale ? -1 : 1;
                const timeA = a.createdAt?.getTime() || 0;
                const timeB = b.createdAt?.getTime() || 0;
                return timeB - timeA;
            });
            setSortedProducts(sorted);
        }
    }, [data.products, selectedCategory, searchTerm]);

    if (loading) {
        return <div className="flex justify-center mt-10"><Spinner/></div>;
    }

    return (
        <div>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold mb-2 text-foreground">Catálogo de Relojes</h1>
                <p className="text-muted-foreground">Explora nuestra colección exclusiva</p>
            </div>
            <div className="mb-6 space-y-4">
                <div className="relative w-full max-w-lg mx-auto">
                    <Input type="text" placeholder="Buscar por nombre de reloj..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10"/>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    {categories.map(category => (
                        <Button key={category} variant={selectedCategory === category ? 'primary' : 'secondary'} onClick={() => setSelectedCategory(category)} className="capitalize">
                            {category === 'all' ? 'Todos' : category}
                        </Button>
                    ))}
                </div>
            </div>
            {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sortedProducts.map(product => (<ProductCard key={product.id} product={product} />))}
                </div>
            ) : (
                <Card className="text-center py-10">
                    <p className="text-muted-foreground">No se encontraron productos o la tienda está vacía.</p>
                </Card>
            )}
        </div>
    );
}