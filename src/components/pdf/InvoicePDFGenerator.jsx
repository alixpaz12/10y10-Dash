/*
 * RUTA DEL ARCHIVO: src/components/pdf/InvoicePDFGenerator.jsx
 * DESCRIPCIÓN: Se ha refactorizado para incluir el componente InvoiceTemplate
 * dentro de este mismo archivo, solucionando el error de resolución de módulos
 * durante el proceso de 'build'.
 */
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useData } from '../../contexts/DataContext';
import { useNotification } from '../../contexts/NotificationContext';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { FileDown } from 'lucide-react';

// --- Funciones de Ayuda ---
const getCORSProxyUrl = (url) => {
    if (!url) return '';
    const cleanUrl = url.replace(/^(https?:\/\/)/, '');
    return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}`;
};

const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = resolve;
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = getCORSProxyUrl(src);
    });
};

// --- Plantilla de la Factura (Componente Aislado) ---
const InvoiceTemplate = ({ sale, settings, users, customers, shippingLocations, products }) => {
    if (!sale) return null;
    
    const formatCurrency = (amount) => `L. ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const cityInfo = shippingLocations.find(loc => loc.id === sale.city);
    const userDetails = users.find(u => u.id === sale.userId || u.uid === sale.userId) || customers.find(c => c.id === sale.customerId);
    const balance = sale.total - (sale.amountPaid || 0) - (sale.extraDiscount || 0);

    const styles = {
        page: { backgroundColor: '#ffffff', color: '#000000', padding: '2rem', width: '210mm', fontFamily: 'Arial, sans-serif' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '2px solid #1f2937', marginBottom: '2rem' },
        companyDetails: { display: 'flex', alignItems: 'center', gap: '1rem' },
        companyName: { fontSize: '2.25rem', fontWeight: 'bold', color: '#1f2937' },
        slogan: { color: '#6b7280' },
        invoiceTitle: { fontSize: '1.5rem', fontWeight: '600', textTransform: 'uppercase', color: '#374151' },
        invoiceInfo: { color: '#4b5563' },
        section: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '2rem', marginBottom: '2rem' },
        sectionTitle: { fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' },
        customerName: { fontWeight: 'bold', fontSize: '1.125rem' },
        textRight: { textAlign: 'right' },
        table: { width: '100%', marginBottom: '2rem', fontSize: '0.875rem', borderCollapse: 'collapse' },
        tableHead: { backgroundColor: '#1f2937', color: '#ffffff' },
        th: { padding: '0.75rem', fontWeight: '600' },
        td: { padding: '0.75rem', verticalAlign: 'top' },
        tableRow: { borderBottom: '1px solid #e5e7eb' },
        totalRow: { display: 'flex', justifyContent: 'space-between' },
        totalLabel: { color: '#4b5563' },
        grandTotalRow: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem', borderTop: '2px solid #1f2937', paddingTop: '0.5rem', marginTop: '0.5rem' },
        paidRow: { display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem' },
        balanceDueRow: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#dc2626', backgroundColor: '#f3f4f6', padding: '0.5rem', borderRadius: '0.375rem' },
        fontMono: { fontFamily: 'monospace' }
    };

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div style={styles.companyDetails}>{settings.logoUrl && <img src={getCORSProxyUrl(settings.logoUrl)} alt="Logo" style={{ height: '5rem', width: '5rem', objectFit: 'contain' }} crossOrigin="anonymous" />}<div><h1 style={styles.companyName}>{settings.companyName || '10y10 Watch Store'}</h1><p style={styles.slogan}>{settings.slogan || 'Calidad y Estilo en tu Muñeca'}</p></div></div>
                <div style={styles.textRight}><h2 style={styles.invoiceTitle}>Factura</h2><p style={styles.invoiceInfo}>Nº: <span style={styles.fontMono}>{sale.id.substring(0, 8).toUpperCase()}</span></p><p style={styles.invoiceInfo}>Fecha: <span style={styles.fontMono}>{sale.date.toLocaleDateString('es-HN')}</span></p><p style={styles.invoiceInfo}>Estado: <span style={{ fontWeight: 'bold' }}>{sale.status}</span></p></div>
            </header>
            <section style={styles.section}>
                <div><h3 style={styles.sectionTitle}>Facturar a:</h3><p style={styles.customerName}>{sale.customerName}</p>{userDetails?.email && <p style={styles.invoiceInfo}>{userDetails.email}</p>}{userDetails?.phone && <p style={styles.invoiceInfo}>{userDetails.phone}</p>}<p style={styles.invoiceInfo}>{sale.shippingAddress}</p><p style={styles.invoiceInfo}>{cityInfo?.city || sale.city}</p></div>
                <div style={styles.textRight}><h3 style={styles.sectionTitle}>Vendido por:</h3><p style={styles.customerName}>{sale.sellerName || 'Tienda Web'}</p></div>
            </section>
            <section>
                <table style={styles.table}>
                    <thead style={styles.tableHead}><tr><th style={{ ...styles.th, textAlign: 'left' }}>Artículo</th><th style={{ ...styles.th, textAlign: 'center' }}>Cant.</th><th style={{ ...styles.th, textAlign: 'right' }}>Precio Unit.</th><th style={{ ...styles.th, textAlign: 'right' }}>Total</th></tr></thead>
                    <tbody>{sale.items.map((item, index) => { const productDetails = products.find(p => p.id === item.productId); const isPromo = productDetails && productDetails.promoPrice && productDetails.promoPrice === item.price; return (<tr key={index} style={styles.tableRow}><td style={styles.td}>{item.productName}</td><td style={{ ...styles.td, textAlign: 'center' }}>{item.quantity}</td><td style={{ ...styles.td, ...styles.fontMono, textAlign: 'right' }}>{isPromo ? (<div><span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.75rem' }}>{formatCurrency(productDetails.salePrice)}</span><br /><span style={{ fontWeight: 'bold', color: '#dc2626' }}>{formatCurrency(item.price)}</span></div>) : (formatCurrency(item.price))}</td><td style={{ ...styles.td, ...styles.fontMono, textAlign: 'right' }}>{formatCurrency(item.price * item.quantity)}</td></tr>); })}</tbody>
                </table>
            </section>
            <section style={{ ...styles.section, alignItems: 'flex-start' }}>
                <div>{sale.payments && sale.payments.length > 0 && !sale.paymentHistoryInvalidated && (<><h3 style={styles.sectionTitle}>Historial de Pagos</h3><table style={{ ...styles.table, marginBottom: 0 }}><thead style={{ backgroundColor: '#e5e7eb' }}><tr><th style={{ ...styles.th, color: '#1f2937', padding: '0.5rem', textAlign: 'left' }}>Fecha</th><th style={{ ...styles.th, color: '#1f2937', padding: '0.5rem', textAlign: 'right' }}>Monto</th></tr></thead><tbody>{sale.payments.map((p, i) => (<tr key={i} style={styles.tableRow}><td style={{ ...styles.td, padding: '0.5rem' }}>{p.date instanceof Date ? p.date.toLocaleDateString('es-HN') : new Date(p.date.seconds * 1000).toLocaleDateString('es-HN')}</td><td style={{ ...styles.td, ...styles.fontMono, padding: '0.5rem', textAlign: 'right' }}>{formatCurrency(p.amount)}</td></tr>))}</tbody></table></>)}</div>
                <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}><div style={styles.totalRow}><span style={styles.totalLabel}>Subtotal:</span><span style={styles.fontMono}>{formatCurrency(sale.subtotal)}</span></div>{sale.discount?.amount > 0 && (<div style={styles.totalRow}><span style={styles.totalLabel}>Descuento ({sale.discount.code}):</span><span style={styles.fontMono}>-{formatCurrency(sale.discount.amount)}</span></div>)}{sale.shippingCost > 0 && (<div style={styles.totalRow}><span style={styles.totalLabel}>Envío:</span><span style={styles.fontMono}>{formatCurrency(sale.shippingCost)}</span></div>)}{sale.extraCost?.amount > 0 && (<div style={styles.totalRow}><span style={styles.totalLabel}>{sale.extraCost.description || 'Costo Extra'}:</span><span style={styles.fontMono}>{formatCurrency(sale.extraCost.amount)}</span></div>)}<div style={styles.grandTotalRow}><span>TOTAL:</span><span style={styles.fontMono}>{formatCurrency(sale.total)}</span></div>{sale.extraDiscount > 0 && (<div style={{ ...styles.totalRow, color: '#2563eb' }}><span style={styles.totalLabel}>Descuento Extra:</span><span style={styles.fontMono}>-{formatCurrency(sale.extraDiscount)}</span></div>)}<div style={styles.paidRow}><span>VALOR PAGADO:</span><span style={styles.fontMono}>{formatCurrency(sale.amountPaid)}</span></div>{balance > 0.01 && (<div style={styles.balanceDueRow}><span>SALDO PENDIENTE:</span><span style={styles.fontMono}>{formatCurrency(balance)}</span></div>)}</div>
            </section>
        </div>
    );
};

// --- Componente Principal del Generador de PDF ---
export default function InvoicePDFGenerator({ sale }) {
    const { data } = useData();
    const { showToast } = useNotification();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGeneratePDF = async () => {
        setIsGenerating(true);

        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        document.body.appendChild(container);

        const root = createRoot(container);
        root.render(
            <InvoiceTemplate 
                sale={sale} 
                settings={data.settings} 
                users={data.users} 
                customers={data.customers} 
                products={data.products} 
                shippingLocations={data.shipping_locations}
            />
        );

        try {
            if (data.settings.logoUrl) {
                await preloadImage(data.settings.logoUrl);
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));

            const content = container.firstChild;
            if (!content) throw new Error("El contenido de la factura no se pudo renderizar.");

            const canvas = await html2canvas(content, {
                scale: 2,
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Factura-10y10-${sale.id.substring(0, 6)}.pdf`);
            showToast("Factura generada.", "success");

        } catch (error) {
            console.error("Error generando PDF:", error);
            showToast(`Error al generar la factura: ${error.message}`, "error");
        } finally {
            root.unmount();
            document.body.removeChild(container);
            setIsGenerating(false);
        }
    };

    return (
        <Button onClick={handleGeneratePDF} variant="ghost" size="icon" disabled={isGenerating} title="Descargar Factura en PDF">
            {isGenerating ? <Spinner /> : <FileDown className="h-4 w-4 text-primary" />}
        </Button>
    );
}
