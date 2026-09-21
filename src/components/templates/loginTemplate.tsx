import React, { useState } from 'react';
import { AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Url } from '../../url';
import HeaderDash from '../atoms/HeaderDash';

export default function LoginTemplate() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const inputStyles = `
    w-full border-4 border-black bg-white px-4 py-3 text-sm md:text-base
    font-bold text-black outline-none transition-all duration-200
    focus:bg-[#fff2a8] focus:-translate-y-1 focus:translate-x-1 focus:shadow-[-4px_4px_0_0_#000000]
    disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-200
  `;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${Url}/users/login`, {
        username: username,
        password: password
      });

      const { user, person, token } = response.data;
      login(user, person, token);
      navigate('/'); 

    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error de conexión al servidor');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#E5E5E5] p-6 font-sans text-black selection:bg-black selection:text-[#ffe34f]">
      <div className="fixed left-0 top-0 z-50 w-full">
          <HeaderDash/>
      </div>
      
      <section className="w-full max-w-105 border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000000] md:p-8">
        
        <div className="mb-8">
          <h1 className="inline-block border-b-4 border-black pb-1 text-4xl font-black uppercase leading-none tracking-tight">
            Login
          </h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-wider text-gray-600">
            Accede al sistema
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 border-4 border-black bg-[#ff6b6b] p-3 text-sm font-black uppercase text-black shadow-[4px_4px_0_0_#000000]">
            <AlertCircle size={20} strokeWidth={3} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label htmlFor="username" className="mb-2 block text-xs font-black uppercase tracking-widest">
              Usuario / Email
            </label>
            <input 
              id="username" 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              disabled={isLoading} 
              className={inputStyles} 
              required 
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-black uppercase tracking-widest">
              Contraseña
            </label>
            <input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              disabled={isLoading} 
              className={inputStyles} 
              required 
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group mt-2 flex w-full items-center justify-center gap-2 border-4 border-black bg-[#ffe34f] py-4 text-sm font-black uppercase tracking-widest text-black transition-all shadow-[6px_6px_0_0_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0_0_#000000] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none md:text-base"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} strokeWidth={3} className="animate-spin" />
                <span>Validando...</span>
              </>
            ) : (
              <>
                <span>Entrar Ahora</span>
                <ArrowRight size={20} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t-4 border-black pt-6 text-center">
          <p className="text-xs font-black uppercase tracking-wider">
            ¿No tienes cuenta? <br className="md:hidden" />
            <a href="#" className="ml-1 inline-block bg-black px-2 py-1 text-[#ffe34f] transition-transform hover:-translate-y-1 hover:shadow-[2px_2px_0_0_#ffe34f]">
              Regístrate
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}