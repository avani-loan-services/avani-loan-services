/* eslint-disable react-refresh/only-export-components */
// src/calculators/auth/CalculatorAuthContext.jsx
// Context Provider for Calculator Suite Authentication State
// Communicates with Server-Side HttpOnly Session API

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CalculatorAuthContext = createContext(null);

export function CalculatorAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const verifySession = useCallback(async () => {
    try {
      const response = await fetch('/api/calculator-auth/verify', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      });
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(!!data.authenticated);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = async (password) => {
    try {
      const response = await fetch('/api/calculator-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: data.message || 'Invalid password.' };
    } catch {
      return { success: false, message: 'Network error during authentication. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/calculator-auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch {
      // ignore network failure during logout
    } finally {
      setIsAuthenticated(false);
    }
  };

  return (
    <CalculatorAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, verifySession }}>
      {children}
    </CalculatorAuthContext.Provider>
  );
}

export function useCalculatorAuth() {
  const context = useContext(CalculatorAuthContext);
  if (!context) {
    throw new Error('useCalculatorAuth must be used within a CalculatorAuthProvider');
  }
  return context;
}
