'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

// --- CONFIGURACIÓN DE URL ---
// Detecta si estamos en producción (Vercel) o en local
const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  
  const [afiliadoId, setAfiliadoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log("Intentando registrar usuario:", formData.username);

      // --- CAMBIO AQUÍ: Usamos la URL dinámica ---
      const response = await axios.post(`${STRAPI_URL}/api/auth/local/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      console.log("Registro exitoso:", response.data);

      // Verificamos si trajo el número de afiliado
      if (response.data.user && response.data.user.numero_afiliado) {
        setAfiliadoId(response.data.user.numero_afiliado);
      } else {
        setAfiliadoId("Pendiente (ID en proceso)");
      }

    } catch (err: any) {
      console.error("Error completo de Axios:", err);
      
      const strapiError = err.response?.data?.error?.message;
      setError(strapiError || 'Ocurrió un error al intentar registrarse.');
      
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border-t-4 border-amgo-green relative overflow-hidden">
      
      {/* Decoración sutil de fondo (Igual al Login) */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>

      <div className="relative z-10">
        
        {/* === HEADER === */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-amgo-dark tracking-tight">Afiliación</h2>
          <p className="text-gray-500 mt-2 font-medium">Únete a la Asociación Mexicana de Go</p>
        </div>

        {/* === ESTADO 1: FORMULARIO === */}
        {!afiliadoId ? (
          <>
            {/* CAJA DE ERROR */}
            {error && (
              <div className="bg-red-50 text-amgo-red p-4 rounded-xl mb-6 text-sm font-bold text-center border border-red-100 animate-pulse">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Nombre de Usuario
                </label>
                <input 
                  name="username"
                  type="text" 
                  required
                  placeholder="Ej. Hikaru Shindo"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amgo-green focus:border-transparent focus:outline-none transition-all font-medium text-amgo-dark"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Correo Electrónico
                </label>
                <input 
                  name="email"
                  type="email" 
                  required
                  placeholder="correo@ejemplo.com"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amgo-green focus:border-transparent focus:outline-none transition-all font-medium text-amgo-dark"
                  onChange={handleChange}
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
                  placeholder="••••••••"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amgo-green focus:border-transparent focus:outline-none transition-all font-medium text-amgo-dark"
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-400 mt-2 font-medium ml-1">Mínimo 6 caracteres</p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 ${
                  loading ? 'bg-gray-400' : 'bg-amgo-dark hover:bg-amgo-green shadow-gray-500/30'
                }`}
              >
                {loading ? 'Procesando...' : 'Obtener Credencial'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500 font-medium">
              ¿Ya eres miembro?{' '}
              <Link href="/login" className="text-amgo-green font-bold hover:underline hover:text-amgo-darkGreen">
                Inicia sesión aquí
              </Link>
            </div>
          </>
        ) : (
          // === ESTADO 2: ÉXITO (Tarjeta de ID) ===
          <div className="animate-fade-in bg-green-50 rounded-2xl p-6 border-2 border-green-100 text-center">
            <div className="w-16 h-16 bg-amgo-green rounded-full flex items-center justify-center text-white text-3xl shadow-lg mx-auto mb-4">
              ✓
            </div>
            
            <h3 className="text-xl font-bold text-amgo-dark mb-1">¡Registro Exitoso!</h3>
            <p className="text-gray-600 text-sm mb-6">Bienvenido a la comunidad.</p>

            <div className="bg-white rounded-xl p-4 border border-dashed border-amgo-green mb-6 shadow-sm">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tu Número de Afiliado</p>
               <p className="text-3xl font-mono font-black text-amgo-dark tracking-widest select-all">
                 {afiliadoId}
               </p>
            </div>

            <Link 
                href="/login"
                className="block w-full bg-amgo-green text-white font-bold py-4 rounded-xl hover:bg-amgo-darkGreen transition-colors uppercase tracking-wider text-sm shadow-md"
            >
                Ir a Iniciar Sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}