'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// --- CONFIGURACIÓN DE URL ---
// Detecta si estamos en producción (Vercel) o en local
const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export default function LoginForm() {
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log("Intentando login con:", formData.identifier);

      // --- CAMBIO AQUÍ: Usamos la URL dinámica ---
      const response = await axios.post(`${STRAPI_URL}/api/auth/local`, {
        identifier: formData.identifier,
        password: formData.password,
      });

      console.log("Login exitoso:", response.data);
      
      // 1. Guardamos los datos manualmente
      localStorage.setItem('jwt', response.data.jwt);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // 2. Forzamos recarga al Home
      window.location.href = "/";

    } catch (err: any) {
      console.error("Error completo de Axios:", err);
      
      const strapiError = err.response?.data?.error?.message;
      
      if (strapiError === "Invalid identifier or password") {
        setError("Usuario o contraseña incorrectos.");
      } else if (strapiError === "Your account email is not confirmed") {
        setError("Tu cuenta no ha sido confirmada. Revisa tu correo o contacta al admin.");
      } else {
        setError(strapiError || 'Ocurrió un error al intentar ingresar.');
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border-t-4 border-amgo-green relative overflow-hidden">
      
      {/* Decoración sutil de fondo */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>

      <div className="relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-amgo-dark tracking-tight">Iniciar Sesión</h2>
          <p className="text-gray-500 mt-2 font-medium">Accede a tu cuenta AMGo</p>
        </div>

        {/* CAJA DE ERROR */}
        {error && (
          <div className="bg-red-50 text-amgo-red p-4 rounded-xl mb-6 text-sm font-bold text-center border border-red-100 animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Email o Usuario
            </label>
            <input
              name="identifier"
              type="text"
              required
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amgo-green focus:border-transparent focus:outline-none transition-all font-medium text-amgo-dark"
              placeholder="Ej: correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amgo-green focus:border-transparent focus:outline-none transition-all font-medium text-amgo-dark"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 ${
              loading ? 'bg-gray-400' : 'bg-amgo-green hover:bg-amgo-darkGreen shadow-green-500/30'
            }`}
          >
            {loading ? 'Validando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 font-medium">
          ¿Aún no tienes ranking?{' '}
          <Link href="/register" className="text-amgo-green font-bold hover:underline hover:text-amgo-darkGreen">
            Afíliate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}