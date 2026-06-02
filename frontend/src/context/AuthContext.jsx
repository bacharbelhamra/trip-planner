import React, { createContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { handleFirebaseLogin, handleLogout, getStoredUser, isAuthenticated } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const skipAuthStateChange = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (skipAuthStateChange.current) return;
      if (firebaseUser && isAuthenticated()) {
        setUser(getStoredUser() || firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (firebaseUser) => {
    const { user: userData, is_new } = await handleFirebaseLogin(firebaseUser);
    setUser(userData);
    return { user: userData, is_new };
  };

  const logout = async () => {
    await handleLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, skipAuthStateChange }}>
      {children}
    </AuthContext.Provider>
  );
}
