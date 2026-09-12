import { apiFetch } from "@/api/client";
import { AuthContextValue, AuthUser, LoginResponse } from "@/api/types";
import * as SecureStore from "expo-secure-store";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync("auth_token");
      const storedUser = await SecureStore.getItemAsync("auth_user");

      if (token && storedUser) {
        setUser(JSON.parse(storedUser) as AuthUser);
      }
      setIsLoading(false);
    })();
  }, []);

  async function login(username: string, password: string): Promise<AuthUser> {
    const data = await apiFetch<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    await SecureStore.setItemAsync("auth_token", data.token);
    await SecureStore.setItemAsync("auth_user", JSON.stringify(data.user));
    setUser(data.user);

    return data.user;
  }

  async function logout(): Promise<void> {
    try {
      await apiFetch("/logout", { method: "POST" });
    } catch (e) {
      // clear local state regardless of server response
    }

    await SecureStore.deleteItemAsync("auth_token");
    await SecureStore.deleteItemAsync("auth_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
