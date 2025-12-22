'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// LISTA DE RANGOS
const RANK_OPTIONS = [
  "Kyu 30", "Kyu 25", "Kyu 20", "Kyu 19", "Kyu 18", "Kyu 17", "Kyu 16", 
  "Kyu 15", "Kyu 14", "Kyu 13", "Kyu 12", "Kyu 11", "Kyu 10", 
  "Kyu 9", "Kyu 8", "Kyu 7", "Kyu 6", "Kyu 5", "Kyu 4", "Kyu 3", "Kyu 2", "Kyu 1",
  "Dan 1", "Dan 2", "Dan 3", "Dan 4", "Dan 5", "Dan 6", "Dan 7", "Dan 8", "Dan 9", "Pro"
];

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth(); 
  const router = useRouter();
  
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Estados del formulario
  const [formData, setFormData] = useState({
    ogs_username: '',
    pandanet_username: '',
    rank: '',
    newPassword: '',         
    confirmNewPassword: '',  
    currentPassword: ''      
  });

  useEffect(() => {
    // Si terminó de cargar y no hay usuario, mandar al login
    if (!authLoading && !user) {
        router.push('/login');
    }
    
    // Rellenar formulario solo si user existe
    if (user) {
      setFormData(prev => ({
        ...prev,
        ogs_username: user.ogs_username || '',
        pandanet_username: user.pandanet_username || '',
        rank: user.rank || '',
      }));
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- CORRECCIÓN CRÍTICA PARA TYPESCRIPT ---
    // Esta línea asegura que 'user' no es null de aquí en adelante.
    if (!user) return; 
    // ------------------------------------------

    setSaving(true);
    setMsg({ type: '', text: '' });

    // 1. Validar que ingresó la contraseña actual
    if (!formData.currentPassword) {
      setMsg({ type: 'error', text: 'Debes ingresar tu contraseña actual para guardar cambios.' });
      setSaving(false);
      return;
    }

    // 2. Validar coincidencia de nueva contraseña
    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      setMsg({ type: 'error', text: 'La nueva contraseña y su confirmación no coinciden.' });
      setSaving(false);
      return;
    }

    try {
      // 3. VERIFICACIÓN DE SEGURIDAD
      const verifyRes = await fetch('http://localhost:1337/api/auth/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: user.email, // TypeScript ya no se queja aquí
          password: formData.currentPassword
        }),
      });

      if (!verifyRes.ok) {
        throw new Error('PASSWORD_INCORRECTO');
      }

      // 4. GUARDAR DATOS
      const token = localStorage.getItem('jwt');
      
      const payload: any = {
        ogs_username: formData.ogs_username,
        pandanet_username: formData.pandanet_username,
        rank: formData.rank,
      };

      if (formData.newPassword) {
        payload.password = formData.newPassword;
      }

      const updateRes = await fetch(`http://localhost:1337/api/users/${user.id}`, { // Ni aquí
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!updateRes.ok) throw new Error('Error al actualizar');

      const updatedUser = await updateRes.json();

      // Actualizar sesión local
      const currentStorage = JSON.parse(localStorage.getItem('user') || '{}');
      const newStorage = { ...currentStorage, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newStorage));
      
      setMsg({ type: 'success', text: '¡Perfil actualizado correctamente!' });
      
      setFormData(prev => ({ 
        ...prev, 
        newPassword: '', 
        confirmNewPassword: '', 
        currentPassword: '' 
      }));
      
      setTimeout(() => window.location.reload(), 1500);

    } catch (error: any) {
      if (error.message === 'PASSWORD_INCORRECTO') {
        setMsg({ type: 'error', text: 'Tu contraseña actual es incorrecta.' });
      } else {
        setMsg({ type: 'error', text: 'Ocurrió un error al guardar los cambios.' });
      }
    } finally {
      setSaving(false);
    }
  };

  // --- RENDERIZADO CONDICIONAL ---
  // Si está cargando O si no hay usuario, mostramos "Cargando..."
  // Esto hace que TypeScript sepa que en el return principal 'user' no es null.
  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center animate-pulse text-amgo-green font-bold">Cargando perfil...</div>;
  }

  return (
    <div className="min-h-screen bg-goban-pattern p-6 pt-24 flex justify-center">
      <div className="bg-white w-full max-w-5xl p-8 rounded-3xl shadow-2xl border-t-8 border-amgo-green flex flex-col md:flex-row gap-10">
        
        {/* --- COLUMNA IZQUIERDA --- */}
        <div className="md:w-1/3 flex flex-col items-center text-center md:border-r md:border-gray-100 md:pr-8">
            <div className="w-32 h-32 bg-amgo-dark rounded-full flex items-center justify-center text-5xl mb-4 border-4 border-gray-100 shadow-lg text-white font-black">
                {user.username.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-black text-amgo-dark">{user.username}</h2>
            <p className="text-gray-500 font-medium text-sm mb-4">{user.email}</p>
            <div className="inline-block bg-green-100 text-amgo-darkGreen px-4 py-1 rounded-full text-xs font-bold border border-green-200 mb-8">
                Afiliado #{user.affiliate_number || 'Pendiente'}
            </div>
            <div className="w-full bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">Ficha Técnica</h3>
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600">Rango:</span>
                    <span className="bg-amgo-green text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">{user.rank || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600">OGS:</span>
                    <span className="text-amgo-dark font-bold text-sm">{user.ogs_username || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600">Pandanet:</span>
                    <span className="text-amgo-dark font-bold text-sm">{user.pandanet_username || '-'}</span>
                </div>
            </div>
        </div>

        {/* --- COLUMNA DERECHA --- */}
        <div className="md:w-2/3">
            <h1 className="text-3xl font-black text-amgo-dark mb-2">Editar Perfil</h1>
            <p className="text-gray-500 mb-6">Modifica tus datos o cambia tu contraseña.</p>
            
            {msg.text && (
                <div className={`p-4 rounded-xl mb-6 font-bold text-center text-sm animate-fade-in ${msg.type === 'error' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                    {msg.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. DATOS DE JUEGO */}
                <div>
                    <h3 className="text-sm font-bold text-amgo-green uppercase tracking-widest mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <span>🀄</span> Identidad de Go
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rango Actual</label>
                            <div className="relative">
                                <select name="rank" value={formData.rank} onChange={handleChange}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amgo-green font-bold text-gray-700 cursor-pointer appearance-none">
                                    <option value="">-- Sin Rango --</option>
                                    {RANK_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Usuario OGS (Opcional)</label>
                            <input type="text" name="ogs_username" value={formData.ogs_username} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amgo-green" placeholder="Nick en OGS" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Usuario Pandanet (Opcional)</label>
                            <input type="text" name="pandanet_username" value={formData.pandanet_username} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amgo-green" placeholder="Nick en Pandanet" />
                        </div>
                    </div>
                </div>

                {/* 2. NUEVA CONTRASEÑA */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2 flex items-center gap-2 mt-6">
                        <span>🔑</span> Cambiar Contraseña <span className="text-[10px] normal-case bg-gray-100 px-2 py-0.5 rounded ml-2">Opcional</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nueva Contraseña</label>
                            <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amgo-green" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirmar Nueva</label>
                            <input type="password" name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amgo-green" placeholder="••••••••" />
                        </div>
                    </div>
                </div>

                {/* 3. CONFIRMACIÓN (OBLIGATORIA) */}
                <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200 mt-8">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🛡️</span>
                        <div className="w-full">
                            <label className="block text-sm font-bold text-amgo-dark mb-1">Confirma tu identidad para guardar</label>
                            <p className="text-xs text-gray-500 mb-3">Por seguridad, ingresa tu contraseña actual para aplicar los cambios.</p>
                            <input 
                                type="password" 
                                name="currentPassword" 
                                value={formData.currentPassword} 
                                onChange={handleChange} 
                                required
                                className="w-full p-3 bg-white border border-yellow-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold" 
                                placeholder="Tu contraseña actual" 
                            />
                        </div>
                    </div>
                </div>

                {/* BOTÓN GUARDAR */}
                <div className="flex justify-end">
                    <button 
                        type="submit" disabled={saving}
                        className={`px-10 py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg transform active:scale-95 ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-amgo-dark hover:bg-amgo-green'}`}
                    >
                        {saving ? 'Verificando...' : 'Guardar Cambios'}
                    </button>
                </div>

            </form>
        </div>
      </div>
    </div>
  );
}