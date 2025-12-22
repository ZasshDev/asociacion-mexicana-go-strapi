'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Evita errores de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm h-[72px]"></nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm transition-all">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* --- LOGO --- */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute left-0 w-7 h-7 bg-amgo-dark rounded-full border-2 border-white shadow-sm z-10 group-hover:scale-110 transition-transform"></div>
            <div className="absolute right-0 w-7 h-7 bg-white rounded-full border-2 border-amgo-dark shadow-sm group-hover:scale-105 transition-transform"></div>
          </div>
          
          <div className="flex flex-col leading-none select-none">
            <span className="text-amgo-dark font-medium tracking-[0.2em] text-xs uppercase">Asociación</span>
            <span className="text-amgo-dark font-black tracking-widest text-lg uppercase">
              Mexicana de <span className="text-amgo-green">Go</span>
            </span>
          </div>
        </Link>

        {/* --- MENÚ DERECHO --- */}
        <div className="hidden md:flex items-center gap-6 font-medium text-sm">
          
          <Link href="/blog" className="text-gray-600 hover:text-amgo-green transition-colors uppercase tracking-wider font-bold">
            Noticias
          </Link>

          {/* LÓGICA: ¿Hay Usuario? */}
          {user ? (
            // === VISTA DE USUARIO LOGUEADO ===
            <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
              
              {/* Texto de Bienvenida */}
              <div className="flex flex-col items-end mr-2">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  Bienvenido,
                </span>
                <span className="text-amgo-green font-black text-base leading-none">
                  {user.username}
                </span>
              </div>

              {/* --- BOTONES DE ROLES --- */}
              <div className="flex items-center gap-2">
                
                {/* 1. Botón de Editor (Si es Editor) */}
                {user.is_editor && (
                  <Link 
                    href="/editor" 
                    className="bg-amgo-dark text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all font-bold uppercase tracking-wider text-[10px] flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    ✍️ Redactar
                  </Link>
                )}

                {/* 2. Botón de Organizador (Si es Organizador) */}
                {user.is_organizer && (
                  <Link 
                    href="/tournaments/admin" 
                    className="bg-amgo-green text-white px-4 py-2 rounded-lg hover:bg-amgo-darkGreen transition-all font-bold uppercase tracking-wider text-[10px] flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    🏆 Torneos
                  </Link>
                )}
              </div>

              {/* Botón de Perfil */}
              <Link 
                href="/profile" 
                className="bg-gray-100 text-amgo-dark px-5 py-2 rounded-lg hover:bg-gray-200 transition-all font-bold uppercase tracking-wider text-xs flex items-center gap-2"
              >
                👤 Mi Perfil
              </Link>

              {/* Botón de Salir */}
              <button 
                onClick={logout}
                className="text-red-500 hover:text-white border border-red-200 hover:bg-red-500 hover:border-red-500 px-4 py-2 rounded-lg transition-all font-bold uppercase tracking-wider text-xs"
              >
                Salir
              </button>
            </div>
          ) : (
            // === VISTA DE INVITADO ===
            <>
              <Link href="/login" className="text-gray-600 hover:text-amgo-green transition-colors uppercase tracking-wider font-bold">
                Ingresar
              </Link>
              <Link 
                href="/register" 
                className="bg-amgo-green text-white px-6 py-3 rounded-lg hover:bg-amgo-darkGreen transition-all shadow-md hover:shadow-lg font-bold uppercase tracking-wider text-xs"
              >
                Afiliarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}