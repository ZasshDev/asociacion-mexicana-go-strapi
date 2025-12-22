'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function JoinTournamentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // 1. Validaciones previas del perfil
    if (!user.affiliate_number) {
      setMsg({ 
        type: 'error', 
        text: 'Necesitas un Número de Afiliado para inscribirte. Ve a tu perfil.' 
      });
      return;
    }

    if (!user.rank) {
      setMsg({ 
        type: 'error', 
        text: 'Debes definir tu Rango (Kyu/Dan) en tu perfil para unirte.' 
      });
      return;
    }

    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const jwt = localStorage.getItem('jwt');

      // 2. Buscar el torneo por su token único
      const tourneyRes = await fetch(
        `http://localhost:1337/api/tournaments?filters[tournament_token][$eq]=${token.trim()}&populate=*`
      );
      const tourneyData = await tourneyRes.json();

      if (tourneyData.data.length === 0) {
        throw new Error('Token de torneo no válido.');
      }

      const tournament = tourneyData.data[0];
      const tournamentId = tournament.id;
      const currentParticipants = tournament.attributes.participants.data.map((p: any) => p.id);

      // 3. Verificar si ya está inscrito
      if (currentParticipants.includes(user.id)) {
        setMsg({ type: 'success', text: 'Ya estás inscrito en este torneo. ¡Prepárate!' });
        setLoading(false);
        return;
      }

      // 4. Actualizar la relación en Strapi (Añadir el ID del usuario a la lista)
      const updateRes = await fetch(`http://localhost:1337/api/tournaments/${tournamentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          data: {
            participants: [...currentParticipants, user.id]
          }
        })
      });

      if (!updateRes.ok) throw new Error('Error al procesar la inscripción.');

      setMsg({ type: 'success', text: `¡Te has inscrito con éxito a: ${tournament.attributes.name}! 🎉` });
      
      // Redirigir después de un momento
      setTimeout(() => router.push('/profile'), 2000);

    } catch (error: any) {
      setMsg({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-goban-pattern p-6 pt-32 flex justify-center">
      <div className="bg-white w-full max-w-xl p-10 rounded-3xl shadow-2xl border-t-8 border-amgo-green h-fit">
        
        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-amgo-dark rounded-2xl flex items-center justify-center text-4xl mb-4 mx-auto shadow-lg rotate-3">
                🏆
            </div>
            <h1 className="text-3xl font-black text-amgo-dark">Unirse a Torneo</h1>
            <p className="text-gray-500 font-medium">Ingresa el código privado del torneo para registrarte.</p>
        </div>

        {msg.text && (
            <div className={`p-4 rounded-xl mb-6 font-bold text-center text-sm animate-fade-in border ${
                msg.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
            }`}>
                {msg.text}
                {msg.type === 'error' && msg.text.includes('perfil') && (
                    <button 
                        onClick={() => router.push('/profile')}
                        className="block mx-auto mt-2 text-xs underline uppercase tracking-tighter"
                    >
                        Ir a completar mi perfil
                    </button>
                )}
            </div>
        )}

        <form onSubmit={handleJoin} className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Token del Torneo
                </label>
                <input 
                    type="text" 
                    value={token}
                    onChange={(e) => setToken(e.target.value.toUpperCase())}
                    placeholder="EJ: COPA-MEXICO-2025"
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amgo-green/10 focus:border-amgo-green font-black text-center text-xl tracking-widest uppercase transition-all"
                    required
                />
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Tus datos de registro</h4>
                <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-bold text-gray-500">Afiliado:</span>
                    <span className={`text-xs font-black ${user?.affiliate_number ? 'text-amgo-dark' : 'text-red-400'}`}>
                        {user?.affiliate_number || 'No detectado'}
                    </span>
                </div>
                <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-bold text-gray-500">Rango:</span>
                    <span className={`text-xs font-black ${user?.rank ? 'text-amgo-green' : 'text-red-400'}`}>
                        {user?.rank || 'No detectado'}
                    </span>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-black text-white text-lg transition-all shadow-xl transform active:scale-95 ${
                    loading ? 'bg-gray-400' : 'bg-amgo-dark hover:bg-amgo-green'
                }`}
            >
                {loading ? 'Verificando...' : 'Confirmar Registro 🏁'}
            </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
            Al registrarte, aceptas que tu rango será utilizado para el emparejamiento suizo.
        </p>
      </div>
    </div>
  );
}