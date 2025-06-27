// src/contexts/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    // } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
} from "firebase/auth";

import { auth } from "../services/firebase";
import { useNavigate } from "react-router";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const idToken = await user.getIdToken(true);
                setToken(idToken);
            } else {
                setToken(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Sign up
    const signUp = async (email, password) => {
        await createUserWithEmailAndPassword(auth, email, password);
        const user = auth.currentUser;
        const idToken = await user.getIdToken(true);
        setToken(idToken);
        navigate("/");
    };

    // Login
    const login = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
        const user = auth.currentUser;
        const idToken = await user.getIdToken(true);
        setToken(idToken);
        navigate("/");
    };
    // Logout
    const logout = () =>
        signOut(auth).then(() => {
            navigate('/');
        });

    const value = {
        currentUser,
        token,
        signUp,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
