'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function TournamentAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el modal de creación
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTourney, setNewTourney] = useState({
    name: '',
    bracket_type: 'double_elimination',
    tournament_token: ''
  });

  // --- PROTECCIÓN DE RUTA ---
  useEffect(() => {
    if (!authLoading) {
      if (!user || !user.is_organizer) {
        router.push('/');
      } else {
        fetchTournaments();
      }
    }
  }, [user, authLoading, router]);

  const fetchTournaments = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch('http://localhost:1337/api/tournaments?populate=participants', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.data) {
        setTournaments(data.data);
      }
    } catch (error) {
      console.error("Error cargando torneos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch('http://localhost:1337/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            ...newTourney,
            tournament_stage: 'registration', // Asegúrate que este valor coincida con tu Enum en Strapi
            tournament_token: newTourney.tournament_token.toUpperCase().replace(/\s+/g, '-')
          }
        })
      });

      if (!res.ok) throw new Error('Error al crear torneo');

      setShowModal(false);
      setNewTourney({ name: '', bracket_type: 'double_elimination', tournament_token: '' });
      fetchTournaments(); // Recargar lista
    } catch (error) {
      alert("Error al crear el torneo. Revisa que el campo 'tournament_stage' exista en Strapi y los permisos estén activos.");
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-amgo-green border-t-transparent rounded-full animate-spin"></div>
            <p className="text-amgo-green font-bold uppercase tracking-widest text-xs">Cargando Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-goban-pattern p-6 pt-24 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
                <h1 className="text-4xl font-black text-amgo-dark tracking-tighter">Panel de Organizador</h1>
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">Gestión de torneos y brackets</p>
            </div>
            <button 
                onClick={() => setShowModal(true)}
                className="bg-amgo-dark text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-amgo-green transition-all shadow-xl transform active:scale-95 flex items-center gap-2"
            >
                <span className="text-xl">+</span> CREAR NUEVO TORNEO
            </button>
        </div>

        {/* LISTADO DE TORNEOS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tournaments.length === 0 ? (
            <div className="col-span-full bg-white p-20 rounded-[40px] border-4 border-dashed border-gray-100 text-center">
                <span className="text-6xl mb-6 block">🏟️</span>
                <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No hay torneos activos</p>
                <button onClick={() => setShowModal(true)} className="mt-4 text-amgo-green font-bold underline">Crea el primero ahora</button>
            </div>
          ) : (
            tournaments.map((t: any) => {
              // --- CORRECCIÓN DE SEGURIDAD (Defensive Coding) ---
              // Extraemos los atributos de forma segura, ya sea que vengan planos o dentro de .attributes
              const data = t.attributes || t; 
              
              // Valores por defecto si algo viene null
              const stage = data.tournament_stage || 'Desconocido'; 
              const token = data.tournament_token || '---';
              const name = data.name || 'Sin Nombre';
              const type = data.bracket_type || 'Suizo';
              
              // Conteo seguro de participantes
              const participants = data.participants?.data || data.participants || [];
              const participantCount = participants.length;
              
              return (
                <div key={t.id} className="bg-white p-8 rounded-[32px] shadow-xl border-t-8 border-amgo-dark hover:shadow-2xl transition-all group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                        <span className="bg-amgo-green/10 text-amgo-green text-[10px] font-black px-3 py-1 rounded-full uppercase border border-amgo-green/20">
                            {stage}
                        </span>
                        <span className="text-gray-300 font-mono text-[10px] font-bold tracking-tighter bg-gray-50 px-2 py-1 rounded">
                          #{token}
                        </span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-amgo-dark mb-1 group-hover:text-amgo-green transition-colors leading-tight">
                      {name}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-200 rounded-full"></span>
                      {type.replace('_', ' ')}
                    </p>
                    
                    <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Participantes:</span>
                            <span className="text-xl font-black text-amgo-dark">
                                {participantCount} <span className="text-gray-300 text-sm">/ 8</span>
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-amgo-green h-full transition-all duration-1000" 
                                style={{ width: `${Math.min((participantCount / 8) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <button 
                        onClick={() => router.push(`/tournaments/admin/${t.id}`)}
                        className="w-full py-4 bg-gray-100 text-amgo-dark rounded-xl font-black text-[10px] hover:bg-amgo-dark hover:text-white transition-all uppercase tracking-[0.2em]"
                    >
                        Gestionar Bracket ➔
                    </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- MODAL DE CREACIÓN --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-amgo-dark/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl z-10 overflow-hidden animate-fade-in border-t-8 border-amgo-green">
                <form onSubmit={handleCreateTournament} className="p-8">
                    <h2 className="text-2xl font-black text-amgo-dark mb-6 flex items-center gap-3">
                        <span className="bg-amgo-green text-white w-10 h-10 rounded-xl flex items-center justify-center text-base">🏆</span>
                        Nuevo Torneo
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nombre del Torneo</label>
                            <input 
                                type="text" 
                                required
                                value={newTourney.name}
                                onChange={(e) => setNewTourney({...newTourney, name: e.target.value})}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amgo-green font-bold"
                                placeholder="Ej: Abierto Mexicano de Go"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Token de Acceso (Único)</label>
                            <input 
                                type="text" 
                                required
                                value={newTourney.tournament_token}
                                onChange={(e) => setNewTourney({...newTourney, tournament_token: e.target.value.toUpperCase()})}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amgo-green font-mono font-bold"
                                placeholder="EJ: TORNEO-2025"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Sistema de Juego</label>
                            <select 
                                value={newTourney.bracket_type}
                                onChange={(e) => setNewTourney({...newTourney, bracket_type: e.target.value})}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amgo-green font-bold appearance-none"
                            >
                                <option value="double_elimination">Doble Eliminación (8 Jugadores)</option>
                                <option value="swiss">Sistema Suizo</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-10 flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={creating}
                            className="flex-1 py-4 bg-amgo-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amgo-green transition-all shadow-lg disabled:bg-gray-300"
                        >
                            {creating ? 'Creando...' : 'Crear Torneo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}