import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Url } from "../url";

// Interfaces de las entidades
interface AuthContextProviderProps {
  children: ReactNode;
}

interface Users {
  id: number;
  username: string;
  state: string;
  fk_people_id: number;
} 

interface Person {
  id: number;
  name: string;
  dni: string;
  address: string;
  email: string;
  fk_school_id: number;
} 

interface AuthContextType {
  usuario: Users | null;
  persona: Person | null;
  token: string | null;
  cargando: boolean;
  login: (datosUsuario: Users, datosPersona: Person, authToken: string) => void;
  logout: () => void;
}

// Creamos el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthContextProviderProps) {
  const navigate = useNavigate();
  // Asignamos explicitamente los tipos a los estados
  const [usuario, setUsuario] = useState<Users | null>(null);
  const [persona, setPersona] = useState<Person | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true); 

  // Efecto para mantener la sesión validando con el backend usando Axios
  useEffect(() => {
    const interceptorId = axios.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }

      return config;
    });

    const responseInterceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const requestUrl = error.config?.url || "";
        const isLoginRequest = requestUrl.includes("/users/login");

        if (error.response?.status === 401 && !isLoginRequest) {
          setUsuario(null);
          setPersona(null);
          setToken(null);
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          localStorage.removeItem("persona");
          navigate("/login", { replace: true });
        }

        return Promise.reject(error);
      },
    );

    const verificarSesion = async () => {
      const storedToken = localStorage.getItem("token");
      
      if (!storedToken) {
        setCargando(false);
        return;
      }

      try {
        await axios.get(`${Url}/users/verify`, {
          headers: {
            "Authorization": `Bearer ${storedToken}`
          }
        });

        const storedUsuario = localStorage.getItem("usuario");
        const storedPersona = localStorage.getItem("persona");
        
        setToken(storedToken);
        if (storedUsuario) setUsuario(JSON.parse(storedUsuario));
        if (storedPersona) setPersona(JSON.parse(storedPersona));

      } catch (error) {
        setUsuario(null);
        setPersona(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        localStorage.removeItem("persona");
        console.error("Sesión inválida o error de red:", error);
      } finally {
        setCargando(false);
      }
    };

    verificarSesion();
    return () => {
      axios.interceptors.request.eject(interceptorId);
      axios.interceptors.response.eject(responseInterceptorId);
    };
  }, [navigate]);
  
  // funcion login
  const login = (datosUsuario: Users, datosPersona: Person, authToken: string) => {
    setUsuario(datosUsuario);
    setPersona(datosPersona);
    setToken(authToken);

    localStorage.setItem("token", authToken);
    localStorage.setItem("usuario", JSON.stringify(datosUsuario));
    if (datosPersona) {
      localStorage.setItem("persona", JSON.stringify(datosPersona));
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    setUsuario(null);
    setPersona(null);
    setToken(null);

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("persona");
  };

  return (
    <AuthContext.Provider value={{ usuario, persona, token, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};