import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock checking local storage for an existing session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('mockSession');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Mock Google Sign In
  const signInWithGoogle = () => {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        const mockUser = {
          uid: 'user_12345_mock',
          displayName: 'Guest User',
          email: 'guest@mediguide.com',
          photoURL: 'https://ui-avatars.com/api/?name=Guest+User&background=0d9488&color=fff'
        };
        localStorage.setItem('mockSession', JSON.stringify(mockUser));
        setCurrentUser(mockUser);
        resolve(mockUser);
      }, 800);
    });
  };

  const logout = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('mockSession');
        setCurrentUser(null);
        resolve();
      }, 500);
    });
  };

  const value = {
    currentUser,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
