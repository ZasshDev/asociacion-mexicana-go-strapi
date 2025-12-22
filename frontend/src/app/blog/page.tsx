import Link from 'next/link';
import Image from 'next/image';

// Función para obtener TODAS las noticias
async function getPosts() {
  try {
    // Ordenamos por fecha de publicación descendente (lo más nuevo primero)
    const res = await fetch(
      'http://127.0.0.1:1337/api/posts?populate=*&sort=publishedAt:desc',
      { cache: 'no-store' } // Cache: no-store para ver los cambios al instante
    );

    if (!res.ok) {
      throw new Error('Error al conectar con Strapi');
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-goban-pattern p-6 pt-24 relative">
      
      {/* HEADER DE LA SECCIÓN */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-amgo-dark tracking-tight mb-2">
            Noticias
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            Mantente al día con la Asociación Mexicana de Go.
          </p>
        </div>

        {/* Botón para ir al Editor (Visible para todos por ahora, idealmente solo editores) */}
        <Link 
          href="/editor" 
          className="bg-amgo-green text-white px-6 py-3 rounded-xl font-bold hover:bg-amgo-darkGreen transition-all shadow-lg hover:shadow-green-500/30 flex items-center gap-2"
        >
          ✍️ Redactar Noticia
        </Link>
      </div>

      {/* GRID DE NOTICIAS */}
      {posts.length > 0 ? (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => {
            
            // Lógica para obtener la URL de la imagen de portada
            const coverData = post.cover;
            let imageUrl = "https://via.placeholder.com/800x600?text=AMGo+News"; // Imagen por defecto

            if (coverData) {
               // Strapi a veces devuelve objeto directo o array, prevenimos ambos casos
               const url = coverData.url || (coverData[0] && coverData[0].url);
               if (url) {
                 imageUrl = `http://127.0.0.1:1337${url}`;
               }
            }

            return (
              <Link 
                href={`/blog/${post.slug}`} 
                key={post.id}
                className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 flex flex-col h-full"
              >
                {/* Imagen de la tarjeta */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs font-bold text-amgo-green mb-2 uppercase tracking-wider">
                    {new Date(post.publishedAt).toLocaleDateString("es-MX", { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  
                  <h3 className="text-xl font-black text-amgo-dark mb-3 leading-tight group-hover:text-amgo-green transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow">
                    {post.excerpt || "Haz clic para leer la noticia completa..."}
                  </p>

                  <span className="text-amgo-dark font-bold text-sm flex items-center gap-2 group-hover:gap-4 transition-all">
                    Leer más <span className="text-amgo-green">→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        // ESTADO VACÍO (Si no hay noticias)
        <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-2xl font-bold text-gray-400">Aún no hay noticias publicadas.</h3>
          <p className="text-gray-400 mt-2">¡Sé el primero en escribir una!</p>
          <Link href="/editor" className="text-amgo-green font-bold mt-4 inline-block hover:underline">
            Ir al Editor
          </Link>
        </div>
      )}
    </div>
  );
}