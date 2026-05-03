import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "bgmi-arena-auth";
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://bgmi-arena-backend.onrender.com";

function readStoredAuth() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
}

async function requestAuth(path, payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Authentication request failed");
  }

  return data;
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => readStoredAuth());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  const login = async (payload) => {
    const data = await requestAuth("login", payload);
    setAuthState({ token: data.token, user: data.user });
    return data;
  };

  const register = async (payload) => {
    const data = await requestAuth("register", payload);
    setAuthState({ token: data.token, user: data.user });
    return data;
  };

  const logout = () => {
    setAuthState({ token: null, user: null });
  };

  const value = useMemo(
    () => ({
      token: authState.token,
      user: authState.user,
      isAuthenticated: Boolean(authState.token),
      login,
      register,
      logout,
    }),
    [authState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
