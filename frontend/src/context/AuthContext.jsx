import { useEffect, useState } from "react";
import { login, logout, register } from "../services/authService";
import { fetchProfile, updateProfile as saveProfile } from "../services/platformService";
import { tokenStore } from "../services/api";
import { AuthContext } from "./AuthContextBase.jsx";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const profile = await fetchProfile();
      setUser(profile);
      return profile;
    } catch {
      tokenStore.clearTokens();
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (tokenStore.getAccessToken()) {
        await loadProfile();
      }

      setLoading(false);
    };

    bootstrap();
  }, []);

  const handleRegister = async (payload) => {
    const data = await register(payload);
    setUser(data.user);
    return data.user;
  };

  const handleLogin = async (payload) => {
    const data = await login(payload);
    setUser(data.user);
    return data.user;
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const handleUpdateProfile = async (payload) => {
    const updatedUser = await saveProfile(payload);
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register: handleRegister,
        login: handleLogin,
        logout: handleLogout,
        refreshUser: loadProfile,
        updateProfile: handleUpdateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
