'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Importamos tu AuthContext

const generateId = () => Math.random().toString(36).substr(2, 9);

type Section = {
  id: string;
  type: 'text' | 'image';
  subtype?: 'paragraph' | 'h2' | 'h3' | 'quote';
  content: string;     
  file: File | null;   
  previewUrl?: string; 
};

export default function EditorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Usamos el estado global de autenticación
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [cover, setCover] = useState<File | null>(null);

  const [sections, setSections] = useState<Section[]>([
    { id: generateId(), type: 'text', subtype: 'paragraph', content: '', file: null }
  ]);

  // --- 🛡️ PROTECCIÓN DE RUTA ---
  useEffect(() => {
    // Si ya terminó de cargar el contexto de autenticación
    if (!authLoading) {
      // Si no hay usuario, al login
      if (!user) {
        router.push('/login');
      } 
      // Si hay usuario pero NO es editor, al inicio con aviso
      else if (!user.is_editor) {
        alert("⛔ Acceso denegado: No tienes permisos de editor.");
        router.push('/');
      }
    }
  }, [user, authLoading, router]);

  // --- FUNCIONES ---

  const addTextSection = () => {
    setSections([...sections, { id: generateId(), type: 'text', subtype: 'paragraph', content: '', file: null }]);
  };

  const addImageSection = () => {
    setSections([...sections, { id: generateId(), type: 'image', content: '', file: null }]);
  };

  const removeSection = (id: string) => {
    if (sections.length === 1) return; 
    setSections(sections.filter(s => s.id !== id));
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    setSections(newSections);
  };

  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index + 1], newSections[index]] = [newSections[index], newSections[index + 1]];
    setSections(newSections);
  };

  const updateSectionContent = (id: string, text: string) => {
    setSections(sections.map(s => (s.id === id ? { ...s, content: text } : s)));
  };

  const updateSectionSubtype = (id: string, subtype: any) => {
    setSections(sections.map(s => (s.id === id ? { ...s, subtype: subtype } : s)));
  };

  const updateSectionImage = (id: string, file: File) => {
    const url = URL.createObjectURL(file); 
    setSections(sections.map(s => (s.id === id ? { ...s, file: file, previewUrl: url } : s)));
  };

  // --- ENVÍO ---

  const generateSlug = (text: string) => {
    return text.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  };

  const uploadFileToStrapi = async (file: File, token: string) => {
    const formData = new FormData();
    formData.append('files', file);
    const res = await fetch('http://localhost:1337/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error("Error subiendo imagen");
    const data = await res.json();
    return data[0]; 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return; // Seguridad extra

    setLoading(true);
    setStatusMessage('Iniciando...');

    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error("No autenticado.");

      let coverId = null;
      if (cover) {
        setStatusMessage('Subiendo portada...');
        const coverData = await uploadFileToStrapi(cover, token);
        coverId = coverData.id;
      }

      setStatusMessage('Procesando contenido...');
      const finalBlocks = [];

      for (const section of sections) {
        if (section.type === 'text' && section.content.trim() !== '') {
          const contentText = section.content;
          
          if (section.subtype === 'h2') {
             finalBlocks.push({ type: "heading", level: 2, children: [{ type: "text", text: contentText }] });
          } else if (section.subtype === 'h3') {
             finalBlocks.push({ type: "heading", level: 3, children: [{ type: "text", text: contentText }] });
          } else if (section.subtype === 'quote') {
             finalBlocks.push({ type: "quote", children: [{ type: "text", text: contentText }] });
          } else {
             const paragraphs = contentText.split('\n').filter(p => p.trim() !== '');
             paragraphs.forEach(p => {
                finalBlocks.push({ type: "paragraph", children: [{ type: "text", text: p }] });
             });
          }
        } 
        else if (section.type === 'image' && section.file) {
          setStatusMessage('Subiendo imagen del cuerpo...');
          const imgData = await uploadFileToStrapi(section.file, token);
          finalBlocks.push({
            type: "image",
            image: imgData, 
            children: [{ type: "text", text: "" }] 
          });
        }
      }

      setStatusMessage('Guardando noticia...');
      const payload = {
        data: {
          title,
          slug: generateSlug(title),
          excerpt,
          content: finalBlocks,
          publishedAt: new Date(),
          cover: coverId 
        }
      };

      const res = await fetch('http://localhost:1337/api/posts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error guardando el post");

      alert('¡Noticia publicada! 🎉');
      router.push('/blog');

    } catch (error: any) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  // --- RENDERIZADO DE CARGA O PROTECCIÓN ---
  if (authLoading || !user || !user.is_editor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-amgo-green font-bold text-xl animate-pulse">Verificando acceso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-goban-pattern p-6 flex justify-center pt-20 pb-20">
      <div className="bg-white w-full max-w-3xl p-8 rounded-3xl shadow-2xl border-t-8 border-amgo-dark">
        <div className="mb-8 pb-4 border-b border-gray-100 flex justify-between items-center">
          <div>
             <h1 className="text-3xl font-black text-amgo-dark">Editor Pro</h1>
             <p className="text-gray-500 text-sm">Usuario: <span className="font-bold text-amgo-green">{user.username}</span></p>
          </div>
          {loading && <div className="text-amgo-green font-bold animate-pulse text-sm">{statusMessage}</div>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amgo-green" placeholder="Título principal" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Resumen</label>
                    <textarea required rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amgo-green" placeholder="Texto para la tarjeta..." />
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Portada</label>
                <div className="relative h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col justify-center items-center hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden">
                    <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {cover ? <img src={URL.createObjectURL(cover)} alt="Preview" className="absolute inset-0 w-full h-full object-cover" /> : <span className="text-3xl">🖼️</span>}
                </div>
            </div>
          </div>
          <hr className="border-gray-100" />
          <div>
            <div className="flex justify-between items-end mb-4">
                <label className="text-sm font-bold text-amgo-dark uppercase tracking-widest">Cuerpo de la Noticia</label>
                <div className="flex gap-2">
                    <button type="button" onClick={addTextSection} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg font-bold text-gray-600 border border-gray-300">➕ Texto</button>
                    <button type="button" onClick={addImageSection} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg font-bold text-gray-600 border border-gray-300">📷 Imagen</button>
                </div>
            </div>
            <div className="space-y-4">
                {sections.map((section, index) => (
                    <div key={section.id} className="relative group animate-fade-in flex gap-2 items-start">
                        <div className="flex flex-col gap-1 mt-2">
                            <button type="button" onClick={() => moveSectionUp(index)} disabled={index === 0} className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-gray-100 hover:bg-amgo-green hover:text-white">▲</button>
                            <span className="text-[10px] text-gray-400 font-mono text-center">{index + 1}</span>
                            <button type="button" onClick={() => moveSectionDown(index)} disabled={index === sections.length - 1} className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-gray-100 hover:bg-amgo-green hover:text-white">▼</button>
                        </div>
                        <div className="flex-grow relative">
                            <button type="button" onClick={() => removeSection(section.id)} className="absolute -right-2 -top-2 bg-white border border-red-100 text-red-400 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-sm hover:bg-red-500 hover:text-white z-10">✕</button>
                            {section.type === 'text' ? (
                                <div className="bg-white border border-gray-200 rounded-xl p-1 shadow-sm focus-within:ring-2 focus-within:ring-green-50">
                                    <div className="flex gap-1 p-2 border-b border-gray-100 mb-2">
                                        <button type="button" onClick={() => updateSectionSubtype(section.id, 'paragraph')} className={`text-xs px-2 py-1 rounded font-bold ${section.subtype === 'paragraph' ? 'bg-amgo-green text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Párrafo</button>
                                        <button type="button" onClick={() => updateSectionSubtype(section.id, 'h2')} className={`text-xs px-2 py-1 rounded font-bold ${section.subtype === 'h2' ? 'bg-amgo-green text-white' : 'text-gray-500 hover:bg-gray-100'}`}>H2</button>
                                        <button type="button" onClick={() => updateSectionSubtype(section.id, 'h3')} className={`text-xs px-2 py-1 rounded font-bold ${section.subtype === 'h3' ? 'bg-amgo-green text-white' : 'text-gray-500 hover:bg-gray-100'}`}>H3</button>
                                        <button type="button" onClick={() => updateSectionSubtype(section.id, 'quote')} className={`text-xs px-2 py-1 rounded font-bold ${section.subtype === 'quote' ? 'bg-amgo-green text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Cita</button>
                                    </div>
                                    <textarea value={section.content} onChange={(e) => updateSectionContent(section.id, e.target.value)} rows={section.subtype === 'paragraph' ? 4 : 2} className={`w-full p-3 outline-none text-gray-700 ${section.subtype === 'h2' ? 'font-black text-xl' : section.subtype === 'quote' ? 'italic text-gray-500' : ''}`} placeholder="Escribe aquí..." />
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xl shrink-0">📷</div>
                                    <input type="file" accept="image/*" onChange={(e) => e.target.files && updateSectionImage(section.id, e.target.files[0])} className="text-sm text-gray-500" />
                                    {section.previewUrl && <img src={section.previewUrl} className="w-20 h-20 rounded-lg object-cover" />}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
          </div>
          <div className="pt-6">
            <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg transform active:scale-95 ${loading ? 'bg-gray-400' : 'bg-amgo-dark hover:bg-amgo-green'}`}>
                {loading ? 'Publicando...' : 'Publicar Noticia 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}