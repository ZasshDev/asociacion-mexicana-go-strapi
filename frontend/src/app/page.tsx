import Link from "next/link";
import Image from "next/image";
import { fetchAPI, getStrapiURL } from "@/lib/strapi"; // <--- 1. Importamos tus herramientas

// --- FUNCIÓN OPTIMIZADA ---
async function getLatestPosts() {
  try {
    // Usamos fetchAPI en lugar de fetch directo para que tome la URL de Render automáticamente
    const response = await fetchAPI(
      "/posts?populate=*&pagination[limit]=3&sort=publishedAt:desc",
      {}, 
      { cache: "no-store" } // Para que las noticias se actualicen siempre
    );
    
    // fetchAPI ya devuelve el JSON. En Strapi los datos suelen estar en response.data
    return response?.data || []; 
  } catch (error) {
    console.error("Error cargando noticias:", error);
    return [];
  }
}

export default async function Home() {
  const latestPosts = await getLatestPosts();

  return (
    <main className="min-h-screen bg-goban-pattern flex flex-col font-sans">
      
      {/* --- HERO SECTION (INTACTO) --- */}
      <section className="relative bg-amgo-dark text-white overflow-hidden">
        <div className="absolute inset-0 bg-mexican-hero opacity-95 z-0"></div>
        
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full hidden md:block pointer-events-none overflow-hidden">
           <div className="absolute top-10 right-10 w-96 h-96 bg-white/10 backdrop-blur-3xl rounded-full border border-white/20 animate-pulse-slow"></div>
           <div className="absolute bottom-20 right-40 w-64 h-64 bg-amgo-red/20 backdrop-blur-3xl rounded-full mix-blend-overlay blur-2xl"></div>
           <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-amgo-green/30 backdrop-blur-xl rounded-full border border-white/10"></div>
        </div>

        <div className="container mx-auto px-6 py-24 md:py-36 relative z-10 flex items-center">
          <div className="max-w-3xl text-center md:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-bold tracking-widest uppercase text-green-100">
              <span className="w-2 h-2 bg-amgo-red rounded-full animate-ping"></span>
              Sitio Oficial
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
              Estrategia <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-green-100 to-green-300">
                Milenaria.
              </span>
            </h1>
            
            <p className="text-xl text-green-50 max-w-xl font-medium leading-relaxed md:pr-10">
              La <strong>Asociación Mexicana de Go</strong> te da la bienvenida. Domina el tablero, obtén tu ranking nacional y compite en el juego más antiguo del mundo.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 pt-6 justify-center md:justify-start">
              <Link 
                href="/register" 
                className="bg-white text-amgo-darkGreen px-10 py-4 rounded-xl font-extrabold text-lg shadow-xl hover:shadow-2xl hover:bg-green-50 hover:-translate-y-1 transition-all duration-300 uppercase tracking-wider"
              >
                Afiliarse Ahora
              </Link>
              <Link 
                href="/login" 
                className="px-10 py-4 rounded-xl font-bold text-lg border-2 border-white/30 text-white hover:bg-white/10 transition-all uppercase tracking-wider"
              >
                Ingresar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN DE TARJETAS (INTACTO) --- */}
      <section className="container mx-auto px-6 -mt-24 relative z-20 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Tarjeta 1 - Ranking */}
          <div className="group bg-white p-10 rounded-[2rem] shadow-2xl border-b-8 border-amgo-green hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
                <div className="w-16 h-16 bg-amgo-green text-white rounded-2xl flex items-center justify-center mb-6 text-3xl shadow-lg shadow-green-500/30">🏆</div>
                <h3 className="text-2xl font-black mb-3 text-amgo-dark tracking-tight">Ranking Nacional</h3>
                <p className="text-gray-600 font-medium leading-relaxed">Sistema oficial de K y D. Mide tu fuerza y compite por representar a México internacionalmente.</p>
            </div>
          </div>

          {/* Tarjeta 2 - Torneos */}
          <div className="group bg-white p-10 rounded-[2rem] shadow-2xl border-b-8 border-amgo-red hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
             <div className="relative z-10">
                <div className="w-16 h-16 bg-amgo-red text-white rounded-2xl flex items-center justify-center mb-6 text-3xl shadow-lg shadow-red-500/30">📅</div>
                <h3 className="text-2xl font-black mb-3 text-amgo-dark tracking-tight">Torneos Oficiales</h3>
                <p className="text-gray-600 font-medium leading-relaxed">Inscripciones prioritarias a congresos, ligas online y el Torneo Nacional Mexicano.</p>
            </div>
          </div>

          {/* Tarjeta 3 - Comunidad */}
          <div className="group bg-white p-10 rounded-[2rem] shadow-2xl border-b-8 border-amgo-dark hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
                <div className="w-16 h-16 bg-amgo-dark text-white rounded-2xl flex items-center justify-center mb-6 text-3xl shadow-lg shadow-gray-500/30">🤝</div>
                <h3 className="text-2xl font-black mb-3 text-amgo-dark tracking-tight">Comunidad y Estudio</h3>
                <p className="text-gray-600 font-medium leading-relaxed">Conecta con clubes locales, accede a material de estudio y revisiones de partidas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN: ÚLTIMAS NOTICIAS (CONECTADA A RENDER) --- */}
      {latestPosts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="text-amgo-green font-bold uppercase tracking-widest text-sm">Actualidad</span>
                <h2 className="text-4xl font-black text-amgo-dark mt-2">Últimas Noticias</h2>
              </div>
              <Link href="/blog" className="hidden md:inline-flex text-amgo-dark font-bold hover:text-amgo-green transition-colors items-center gap-2">
                Ver todo el historial →
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {latestPosts.map((post: any) => {
                 const title = post.title || "Sin título";
                 const excerpt = post.excerpt || "Sin resumen";
                 // Validamos el slug, si no existe ponemos "#"
                 const slug = post.slug || "#";
                 
                 // --- LOGICA DE IMAGEN MEJORADA ---
                 const coverData = post.cover; 
                 let imageUrl = "https://via.placeholder.com/800x600?text=AMGo"; 
                 
                 if (coverData) {
                    // Si es un array (Strapi v4/v5 a veces varía) o objeto directo
                    const url = coverData.url || (Array.isArray(coverData) && coverData[0]?.url);
                    if (url) {
                        // Usamos la función auxiliar para que funcione en Prod (Render) y Dev (Local)
                        imageUrl = getStrapiURL(url);
                    }
                 }

                 return (
                   <Link key={post.id} href={slug !== "#" ? `/blog/${slug}` : "#"} className="group block">
                     <article className="bg-gray-50 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                        <div className="relative h-48 w-full overflow-hidden">
                           <Image 
                             src={imageUrl} 
                             alt={title} 
                             fill 
                             className="object-cover group-hover:scale-105 transition-transform duration-500" 
                             unoptimized // Importante si usas hostings externos sin configurar dominios en next.config
                           />
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="font-bold text-xl text-amgo-dark mb-2 group-hover:text-amgo-green transition-colors line-clamp-2">{title}</h3>
                          <p className="text-gray-500 text-sm line-clamp-3 mb-4">{excerpt}</p>
                          <span className="text-xs font-bold uppercase tracking-wider text-amgo-green mt-auto">Leer noticia</span>
                        </div>
                     </article>
                   </Link>
                 )
              })}
            </div>
            
            <div className="mt-8 text-center md:hidden">
              <Link href="/blog" className="text-amgo-green font-bold">Ver todo el historial →</Link>
            </div>
          </div>
        </section>
      )}

    </main>
  );
}