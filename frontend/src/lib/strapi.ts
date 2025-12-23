// frontend/src/lib/strapi.ts

// 1. Buscamos la URL en las variables de entorno. 
// Si no existe (local), usamos localhost.
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// 2. Función auxiliar para obtener la URL completa de cualquier archivo o ruta
export function getStrapiURL(path = "") {
  return `${STRAPI_URL}${path}`;
}

// 3. Función principal para pedir datos (Fetch)
export async function fetchAPI(path: string, urlParamsObject = {}, options = {}) {
  try {
    // Unimos las opciones por defecto con las que pases
    const mergedOptions = {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    };

    // Armamos la URL completa (ej: https://.../api/noticias)
    const requestUrl = getStrapiURL(`/api${path}`);
    
    // Hacemos la petición
    const response = await fetch(requestUrl, mergedOptions);

    // Si la respuesta no es OK, lanzamos error
    if (!response.ok) {
      console.error("Error en la respuesta de Strapi:", response.statusText);
      throw new Error(`Error al conectar con Strapi: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error(error);
    // Retornamos null para no romper toda la página si falla la API
    return null; 
  }
}