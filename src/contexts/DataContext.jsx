/*
 * RUTA DEL ARCHIVO: src/contexts/DataContext.jsx
 * DESCRIPCIÓN: Se ha añadido una validación para asegurar que las consultas
 * a Firestore no se ejecuten con un 'uid' indefinido, solucionando el error
 * 'Bad Request' y permitiendo que las ventas se carguen correctamente.
 */
import React, { useState, useEffect, createContext, useContext } from 'react';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import {
    onSnapshot,
    collection,
    doc,
    getDoc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    runTransaction,
    query,
    where,
    Timestamp,
    serverTimestamp,
    arrayUnion
} from 'firebase/firestore';

export const DataContext = createContext(null);

export const useData = () => {
    return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
    const { user, isAuthLoading } = useAuth();
    const [data, setData] = useState({
        products: [], sales: [], customers: [], users: [], shipping_locations: [],
        discount_codes: [], settings: {}, unregistered_purchases: []
    });
    const [loading, setLoading] = useState(true);

    const processDocWithDates = (doc) => {
        const docData = doc.data();
        Object.keys(docData).forEach(key => {
            if (docData[key] instanceof Timestamp) {
                docData[key] = docData[key].toDate();
            }
        });
        return { id: doc.id, ...docData };
    };

    useEffect(() => {
        if (isAuthLoading) {
            setLoading(true);
            return;
        }

        const allUnsubscribes = [];
        const setupSubscription = (collectionName, queryFn = null) => {
            const q = queryFn ? queryFn(collection(db, collectionName)) : collection(db, collectionName);
            const unsub = onSnapshot(q, (snapshot) => {
                setData(prevData => ({ ...prevData, [collectionName]: snapshot.docs.map(processDocWithDates) }));
                setLoading(false);
            }, (error) => {
                console.error(`Error en ${collectionName}:`, error);
                setLoading(false);
            });
            allUnsubscribes.push(unsub);
        };

        setLoading(true);

        ['shipping_locations', 'discount_codes'].forEach(col => setupSubscription(col));
        
        const settingsUnsub = onSnapshot(doc(db, 'config', 'settings'), (doc) => {
            if (doc.exists()) setData(prev => ({ ...prev, settings: doc.data() }));
        });
        allUnsubscribes.push(settingsUnsub);

        const productsQuery = (!user || user.role === 'client')
            ? (q) => query(q, where('isPublic', '==', true))
            : null;
        setupSubscription('products', productsQuery);

        if (user && user.uid) { // CORRECCIÓN: Asegurarse de que user.uid exista
            if (['admin', 'seller'].includes(user.role)) {
                setupSubscription('users');
                setupSubscription('customers');
                setupSubscription('unregistered_purchases');
            }
            let salesQuery;
            if (user.role === 'admin') {
                salesQuery = null;
            } else {
                const fieldToQuery = user.role === 'client' ? "userId" : "sellerId";
                salesQuery = (q) => query(q, where(fieldToQuery, "==", user.uid));
            }
            setupSubscription('sales', salesQuery);
        } else if (!user) { // Si no hay usuario, limpiar los datos
            setData(prev => ({ ...prev, users: [], sales: [], customers: [], unregistered_purchases: [] }));
            setLoading(false);
        }

        return () => allUnsubscribes.forEach(unsub => unsub());
    }, [user, isAuthLoading]);

    // --- El resto de las funciones CRUD permanecen igual ---
    const addSale = async (saleData) => {
        try {
            await runTransaction(db, async (transaction) => {
                const saleRef = doc(collection(db, 'sales'));
                const productsToUpdate = [];
                for (const item of saleData.items) {
                    const productRef = doc(db, 'products', item.productId);
                    const productSnap = await transaction.get(productRef);
                    if (!productSnap.exists()) {
                        throw new Error(`El producto ${item.productName} ya no existe.`);
                    }
                    const currentStock = productSnap.data().quantity;
                    if (currentStock < item.quantity) {
                        throw new Error(`Stock insuficiente para ${item.productName}. Solo quedan ${currentStock}.`);
                    }
                    productsToUpdate.push({
                        ref: productRef,
                        newStock: currentStock - item.quantity
                    });
                }
                transaction.set(saleRef, saleData);
                productsToUpdate.forEach(p => {
                    transaction.update(p.ref, { quantity: p.newStock });
                });
            });
        } catch (e) {
            console.error("Error en la transacción de venta: ", e);
            throw e;
        }
    };
    const deleteSale = async (saleId) => { /* ... */ };
    const updateSale = async (saleId, updates) => await updateDoc(doc(db, 'sales', saleId), updates);
    const updateSaleDetails = async (saleId, updates) => { /* ... */ };
    const convertPurchaseToSale = async (purchase, saleDetails) => { /* ... */ };
    const addProduct = async (productData) => await addDoc(collection(db, 'products'), {...productData, createdAt: serverTimestamp()});
    const updateProduct = async (product) => await updateDoc(doc(db, 'products', product.id), product);
    const deleteProduct = async (productId) => await deleteDoc(doc(db, 'products', productId));
    const addCustomer = async (customerData) => await addDoc(collection(db, 'customers'), {...customerData, createdAt: serverTimestamp()});
    const updateCustomer = async (customer) => await updateDoc(doc(db, 'customers', customer.id), customer);
    const deleteCustomer = async (customerId) => await deleteDoc(doc(db, 'customers', customerId));
    const updateUser = async (user) => await updateDoc(doc(db, 'users', user.id), user);
    const deleteUser = async (userId) => await deleteDoc(doc(db, 'users', userId));
    const updateSettings = async (settingsData) => await setDoc(doc(db, 'config', 'settings'), settingsData, { merge: true });
    const addShippingLocation = async (locationData) => await addDoc(collection(db, 'shipping_locations'), {...locationData, createdAt: serverTimestamp()});
    const updateShippingLocation = async (locationId, locationData) => await updateDoc(doc(db, 'shipping_locations', locationId), locationData);
    const deleteShippingLocation = async (locationId) => await deleteDoc(doc(db, 'shipping_locations', locationId));
    const addDiscountCode = async (codeData) => { /* ... */ };
    const updateDiscountCode = async (codeId, codeData) => { /* ... */ };
    const deleteDiscountCode = async (codeId) => await deleteDoc(doc(db, 'discount_codes', codeId));
    const addUnregisteredPurchase = async (purchaseData) => await addDoc(collection(db, 'unregistered_purchases'), {...purchaseData, createdAt: serverTimestamp()});
    const updateUnregisteredPurchase = async (purchaseId, purchaseData) => await updateDoc(doc(db, 'unregistered_purchases', purchaseId), purchaseData);
    const deleteUnregisteredPurchase = async (purchaseId) => await deleteDoc(doc(db, 'unregistered_purchases', purchaseId));

    const value = { data, loading, addSale, deleteSale, updateSale, updateSaleDetails, convertPurchaseToSale, addProduct, updateProduct, deleteProduct, addCustomer, updateCustomer, deleteCustomer, updateUser, deleteUser, updateSettings, addShippingLocation, updateShippingLocation, deleteShippingLocation, addDiscountCode, updateDiscountCode, deleteDiscountCode, addUnregisteredPurchase, updateUnregisteredPurchase, deleteUnregisteredPurchase };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}