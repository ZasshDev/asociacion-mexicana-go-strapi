export default [
  'strapi::errors',
  {
    name: 'strapi::cors',
    config: {
      enabled: true, 
      origin: ['*'], // <--- AQUÍ ESTÁ LA MAGIA. El asterisco abre la puerta a todos.
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::security',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];