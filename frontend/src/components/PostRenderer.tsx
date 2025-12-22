'use client'; 

import { useState } from 'react';
// Si esta línea sigue dando error rojo, es que falta el 'npm install' del Paso 1
import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import Image from 'next/image';
import Link from 'next/link';

// Variable dinámica para la URL
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

export default function PostRenderer({ content }: { content: BlocksContent }) {
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  if (!content) return null;

  return (
    <>
      <BlocksRenderer
        content={content}
        blocks={{
          // --- Agregamos ': any' para que TypeScript no se queje ---
          image: ({ image }: any) => {
            if (!image || !image.url) return null;
            
            const imageUrl = image.url.startsWith('http') 
                ? image.url 
                : `${STRAPI_URL}${image.url}`;

            return (
              <div 
                className="my-8 relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-100 group cursor-zoom-in"
                onClick={() => setZoomImage(imageUrl)}
              >
                <Image
                  src={imageUrl}
                  alt={image.alternativeText || "Imagen"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-bold shadow-md">🔍 Ampliar</span>
                </div>
              </div>
            );
          },
          link: ({ children, url }: any) => (
            <Link href={url} className="text-amgo-green font-bold hover:underline decoration-2 underline-offset-2">
              {children}
            </Link>
          ),
          heading: ({ children, level }: any) => {
            switch (level) {
              case 1: return <h1 className="text-4xl font-black text-amgo-dark mt-10 mb-4">{children}</h1>;
              case 2: return <h2 className="text-3xl font-bold text-amgo-dark mt-10 mb-4 border-l-4 border-amgo-green pl-4">{children}</h2>;
              case 3: return <h3 className="text-2xl font-bold text-gray-700 mt-8 mb-3">{children}</h3>;
              case 4: return <h4 className="text-xl font-bold text-gray-600 mt-6 mb-2">{children}</h4>;
              default: return <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>;
            }
          },
          quote: ({ children }: any) => (
            <blockquote className="border-l-4 border-amgo-green bg-green-50/50 p-6 my-8 rounded-r-xl italic text-gray-700 text-lg font-medium shadow-sm">
              " {children} "
            </blockquote>
          ),
          paragraph: ({ children }: any) => (
            <p className="mb-6 text-gray-700 leading-relaxed text-lg">{children}</p>
          ),
          // Agregamos listas por si acaso usas bullets en tu texto
          list: ({ children, format }: any) => {
            if (format === 'ordered') {
                return <ol className="list-decimal pl-6 mb-6 space-y-2 text-gray-700 text-lg">{children}</ol>;
            }
            return <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700 text-lg">{children}</ul>;
          },
        }}
      />

      {zoomImage && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in p-4"
            onClick={() => setZoomImage(null)}
        >
            <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
                <img 
                    src={zoomImage} 
                    alt="Zoom" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
                <button 
                    onClick={() => setZoomImage(null)}
                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-md transition-all"
                >
                    ✕
                </button>
            </div>
        </div>
      )}
    </>
  );
}