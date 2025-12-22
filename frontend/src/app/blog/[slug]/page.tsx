import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import PostRenderer from '@/components/PostRenderer'; 

// --- 1. FUNCIÓN PARA BUSCAR DATOS EN STRAPI ---
async function getPostBySlug(slug: string) {
  try {
    const res = await fetch(
      `http://127.0.0.1:1337/api/posts?filters[slug][$eq]=${slug}&populate=*`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data.length > 0 ? data.data[0] : null;
  } catch (error) {
    return null;
  }
}

// --- 2. COMPONENTE DE LA PÁGINA (SERVIDOR) ---
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = await params; 
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  // Preparamos datos simples
  const title = post.title;
  const content = post.content; // JSON puro de Strapi
  
  // Lógica de la portada (Header)
  const coverData = post.cover; 
  let headerImageUrl = "https://via.placeholder.com/1200x600?text=AMGo"; 
  if (coverData) {
      const url = coverData.url || (coverData[0] && coverData[0].url);
      if (url) headerImageUrl = `http://127.0.0.1:1337${url}`;
  }

  const date = new Date(post.publishedAt).toLocaleDateString("es-MX", {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <main className="min-h-screen bg-white">
      {/* HEADER */}
      <div className="relative h-[50vh] w-full">
        <Image 
          src={headerImageUrl} 
          alt={title || "Portada"} 
          fill 
          className="object-cover" 
          unoptimized 
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute bottom-0 w-full p-12">
            <div className="container mx-auto">
                <Link href="/blog" className="text-white/80 hover:text-white font-bold text-sm uppercase mb-4 block">← Volver</Link>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{title}</h1>
                <p className="text-green-400 font-bold">{date}</p>
            </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <article className="container mx-auto max-w-3xl px-6 py-16">
        <div className="prose prose-lg prose-green mx-auto">
           
           {/* AQUÍ ESTABA EL ERROR ANTES. 
               Asegúrate de que esta línea sea EXACTAMENTE así: */}
           {content ? <PostRenderer content={content} /> : <p>Sin contenido.</p>}

        </div>
      </article>
    </main>
  );
}