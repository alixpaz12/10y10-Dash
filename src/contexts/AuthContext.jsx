/*
 * RUTA DEL ARCHIVO: src/contexts/AuthContext.jsx
 * DESCRIPCIÓN: Se ha añadido la exportación de 'AuthContext' para solucionar
 * el error de importación que causaba la pantalla en blanco.
 */
import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useNotification } from './NotificationContext';

// CORRECCIÓN: Se exporta el AuthContext directamente.
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const { showToast } = useNotification();

    useEffect(() => {
        let unsubscribeDoc = () => {};
        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            unsubscribeDoc(); 
            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                unsubscribeDoc = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        setUser({ uid: firebaseUser.uid, ...doc.data() });
                    } else {
                        console.error("User authenticated but no document in Firestore.");
                        setUser(null);
                    }
                    setIsAuthLoading(false);
                }, (error) => {
                    console.error("Error listening to user document:", error);
                    setUser(null);
                    setIsAuthLoading(false);
                });
            } else {
                setUser(null);
                setIsAuthLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            unsubscribeDoc();
        };
    }, []);

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userDocRef = doc(db, 'users', userCredential.user.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                showToast('Inicio de sesión exitoso.', 'success');
                return { success: true, role: docSnap.data().role };
            } else {
                throw new Error("No user data found in Firestore.");
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            showToast(`Error al iniciar sesión: ${error.code}`, 'error');
            return { success: false };
        }
    };

    const register = async (name, email, password, phone, city) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = { name, email, role: 'client', phone, city, createdAt: serverTimestamp() };
            await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
            showToast('Registro exitoso. ¡Bienvenido!', 'success');
            return userCredential;
        } catch (error) {
            console.error("Error al registrar:", error);
            showToast(`Error al registrar: ${error.code}`, 'error');
            return null;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            showToast('Has cerrado sesión.', 'info');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            showToast("Error al cerrar sesión.", 'error');
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
            showToast("No estás autenticado.", "error");
            return false;
        }
        const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
        try {
            await reauthenticateWithCredential(firebaseUser, credential);
            await updatePassword(firebaseUser, newPassword);
            showToast("Contraseña actualizada con éxito.", "success");
            return true;
        } catch (error) {
            console.error("Error cambiando contraseña:", error);
            showToast(`Error: ${error.message}`, "error");
            return false;
        }
    };

    const value = { user, isAuthLoading, login, register, logout, changePassword };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
