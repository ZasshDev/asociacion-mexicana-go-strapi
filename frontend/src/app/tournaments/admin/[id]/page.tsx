'use client';

import { useState, useEffect, use } from 'react'; // 'use' es necesario en Next.js 13+ para params
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// --- UTILIDAD: CONVERTIR RANGO A PUNTAJE NUMÉRICO ---
const getRankScore = (rank: string) => {
  if (!rank) return 0;
  if (rank.includes('Pro')) return 100;
  
  const number = parseInt(rank.replace(/\D/g, '')); // Extraer número
  if (rank.includes('Dan')) return 30 + number;     // Dan 1 = 31, Dan 9 = 39
  if (rank.includes('Kyu')) return 31 - number;     // Kyu 30 = 1, Kyu 1 = 30
  
  return 0;
};

export default function TournamentManagerPage({ params }: { params: Promise<{ id: string }> }) {
  // Desempaquetar params (Next.js 15 lo requiere como promesa)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Cargar datos
  useEffect(() => {
    if (resolvedParams && user?.is_organizer) {
      fetchTournamentData(resolvedParams.id);
    }
  }, [resolvedParams, user]);

  const fetchTournamentData = async (id: string) => {
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch(`http://localhost:1337/api/tournaments/${id}?populate=participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTournament(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DEL GENERADOR DE BRACKET ---
  const handleGenerateBracket = async () => {
    if (!tournament) return;
    
    // 1. Validar cantidad de jugadores (Para este ejemplo forzamos 8)
    const participants = tournament.attributes.participants.data;
    if (participants.length < 8) {
      alert("❌ Necesitas exactamente 8 jugadores para generar una llave de Doble Eliminación estándar.");
      return;
    }

    setGenerating(true);

    // 2. ORDENAR POR NIVEL (Seeding)
    // El mejor rank va primero
    const seededPlayers = [...participants].sort((a, b) => {
      const scoreA = getRankScore(a.attributes.rank);
      const scoreB = getRankScore(b.attributes.rank);
      return scoreB - scoreA; // Mayor a menor
    });

    // 3. CREAR LA ESTRUCTURA INICIAL (JSON)
    // En seeding estándar de 8: 1vs8, 4vs5, 2vs7, 3vs6
    const bracketStructure = {
      round1: [
        { match: 1, p1: seededPlayers[0], p2: seededPlayers[7], winner: null }, // 1 vs 8
        { match: 2, p1: seededPlayers[3], p2: seededPlayers[4], winner: null }, // 4 vs 5
        { match: 3, p1: seededPlayers[1], p2: seededPlayers[6], winner: null }, // 2 vs 7
        { match: 4, p1: seededPlayers[2], p2: seededPlayers[5], winner: null }  // 3 vs 6
      ],
      losers_round1: [], // Se llenará con los perdedores de R1
      semis: [],
      final: []
    };

    try {
      const token = localStorage.getItem('jwt');
      
      // 4. GUARDAR EN STRAPI
      await fetch(`http://localhost:1337/api/tournaments/${tournament.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            tournament_stage: 'active', // Cambia estado a ACTIVO
            bracket_data: bracketStructure // Guarda el JSON del bracket
          }
        })
      });

      alert("¡Bracket Generado! El torneo ha comenzado. 🥋");
      window.location.reload(); // Recargar para ver el cambio

    } catch (error) {
      alert("Error guardando el bracket.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !tournament) return <div className="min-h-screen flex items-center justify-center animate-pulse text-amgo-green font-bold">Cargando Torneo...</div>;

  const data = tournament.attributes;
  const participants = data.participants.data || [];

  return (
    <div className="min-h-screen bg-goban-pattern p-6 pt-24 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        
        {/* HEADER */}
        <div className="bg-white p-8 rounded-[32px] shadow-xl border-t-8 border-amgo-dark mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${data.tournament_stage === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                    {data.tournament_stage === 'active' ? '🟢 En Curso' : '🟡 Inscripción'}
                </span>
                <h1 className="text-3xl font-black text-amgo-dark mt-2">{data.name}</h1>
                <p className="text-gray-400 font-mono text-xs font-bold mt-1">TOKEN: {data.tournament_token}</p>
            </div>
            
            {/* BOTÓN DE ACCIÓN PRINCIPAL */}
            {data.tournament_stage === 'registration' ? (
                <button 
                    onClick={handleGenerateBracket}
                    disabled={generating}
                    className="bg-amgo-green text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-amgo-darkGreen transition-all shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed animate-bounce-slow"
                >
                    {generating ? 'Calculando Seeds...' : '⚙️ GENERAR BRACKET Y COMENZAR'}
                </button>
            ) : (
                <div className="bg-gray-100 px-6 py-3 rounded-xl text-gray-500 font-bold text-xs uppercase tracking-widest">
                    Torneo Iniciado
                </div>
            )}
        </div>

        {/* LISTA DE INSCRITOS (PRE-BRACKET) */}
        {data.tournament_stage === 'registration' && (
            <div className="bg-white p-8 rounded-[32px] shadow-lg">
                <h3 className="text-xl font-black text-amgo-dark mb-6 flex justify-between">
                    <span>Jugadores Inscritos</span>
                    <span className="text-amgo-green">{participants.length} / 8</span>
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                    {participants.length === 0 ? (
                        <p className="text-gray-400 font-bold italic col-span-2 text-center py-10">Esperando jugadores...</p>
                    ) : (
                        participants.map((p: any, index: number) => {
                            const score = getRankScore(p.attributes.rank);
                            return (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-gray-300 shadow-sm border">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-amgo-dark">{p.attributes.username}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Afiliado #{p.attributes.affiliate_number}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="bg-amgo-dark text-white text-[10px] px-2 py-1 rounded font-bold block">{p.attributes.rank}</span>
                                        <span className="text-[9px] text-gray-300 font-mono mt-1 block">Score: {score}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                
                {participants.length < 8 && (
                   <div className="mt-6 p-4 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-xl text-center border border-yellow-100">
                      ⚠️ Faltan {8 - participants.length} jugadores para poder iniciar el bracket.
                   </div>
                )}
            </div>
        )}

        {/* VISTA DEL BRACKET (CUANDO YA ESTÁ ACTIVO) */}
        {data.tournament_stage === 'active' && data.bracket_data && (
            <div className="bg-white p-8 rounded-[32px] shadow-lg border-t-8 border-amgo-green min-h-[400px]">
                <h3 className="text-xl font-black text-amgo-dark mb-8 text-center uppercase tracking-widest">
                    🔥 Ronda 1 - Winners Bracket
                </h3>
                
                {/* Visualización simple de las tarjetas de partida */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.bracket_data.round1.map((match: any) => (
                        <div key={match.match} className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 hover:border-amgo-green transition-colors cursor-pointer group">
                            <div className="text-center mb-3">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Match {match.match}</span>
                            </div>
                            
                            {/* Jugador 1 */}
                            <div className="flex justify-between items-center mb-2 p-2 bg-white rounded-xl shadow-sm">
                                <span className="font-bold text-sm text-amgo-dark">{match.p1.attributes.username}</span>
                                <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 rounded">{match.p1.attributes.rank}</span>
                            </div>
                            
                            <div className="text-center text-xs text-gray-300 font-black my-1">VS</div>

                            {/* Jugador 2 */}
                            <div className="flex justify-between items-center p-2 bg-white rounded-xl shadow-sm">
                                <span className="font-bold text-sm text-amgo-dark">{match.p2.attributes.username}</span>
                                <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 rounded">{match.p2.attributes.rank}</span>
                            </div>

                            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                                <span className="text-[10px] bg-amgo-green text-white px-3 py-1 rounded-full font-bold">REPORTAR RESULTADO</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center text-gray-400 text-sm font-bold">
                    (Aquí continuaremos implementando la lógica para avanzar rondas...)
                </div>
            </div>
        )}

      </div>
    </div>
  );
}