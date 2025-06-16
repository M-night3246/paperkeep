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

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
            const idToken = await user.getIdToken();
            setToken(idToken);
        } else {
            setToken(null);
        }
        setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Sign up
    const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);

    // Login
    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

    // Logout
    const logout = () =>
        signOut(auth).then(() => {
        // Optionally redirect here or handle in UI
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
