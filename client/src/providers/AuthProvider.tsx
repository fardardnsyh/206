import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from '../api/axios';
import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, logoutUser, refreshAccessToken } from '../api/auth';
import { jwtDecode } from 'jwt-decode';
import { Auth } from '../types/Auth';

interface AuthContextType {
  user: Auth | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<Auth | null>>;
}

axios.defaults.withCredentials = true;
axios.defaults.headers['content-type'] = 'application/json';

export const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [user, setUser] = useState<Auth | null>(null);

  // TODO: how to make this automatic
  // if (user) {
  //   user.isAuthenticated = !!user;
  // }
  // useCallback ????
  // const logout = () => {
  //   setUser(null);
  //   navigate('/');
  // };

  useEffect(() => {
    console.log('useEffect => user is', user);
    const requestInterceptor = axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${user?.accessToken}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      // response in 2xx range
      (response) => response,
      // response outside 2xx range
      async (error: AxiosError) => {
        if (error.config) {
          const prevRequest: InternalAxiosRequestConfig & { sent?: boolean } =
            error.config;

          if (error?.response?.status === 403 && !prevRequest.sent) {
            prevRequest.sent = true;

            try {
              console.log('refreshing');
              const token = await refreshAccessToken();
              const decoded = jwtDecode<{ name: string; email: string }>(token);

              // update access token (should I keep prev ?)
              setUser({
                name: decoded.name,
                email: decoded.email,
                accessToken: token,
                isAuthenticated: true,
              });

              // update accessToken
              // setUser((prev) => ({
              //   ...prev!,
              //   accessToken: token,
              //   isAuthenticated: true,
              // }));

              prevRequest.headers.Authorization = `Bearer ${token}`;
              return axios.request(prevRequest);
            } catch (err) {
              console.error('could not refresh access token');
              setUser(null);
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      console.log('log in setUser');
      const { accessToken } = await loginUser(email, password);
      const decoded = jwtDecode<{ name: string; email: string }>(accessToken);

      // update access token (should I keep prev ?)
      setUser({
        name: decoded.name,
        email: decoded.email,
        accessToken,
        isAuthenticated: true,
      });

      console.log('after setUser, user is', user);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('login error:', err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    void logoutUser();
    navigate('/');
  };

  // const refresh = async () => {
  //   const token = await refreshAccessToken();
  //   setUser({
  //     email: 'unknown',
  //     accessToken: token,
  //     isAuthenticated: true,
  //   });
  // };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

