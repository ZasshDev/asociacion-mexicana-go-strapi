import path from 'path';
import dns from 'dns'; 
import pgConnectionString from 'pg-connection-string';

const { parse } = pgConnectionString;

// 1. FORZAMOS A NODE A USAR IPV4 (Vital para Supabase en Node 17+)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  let postgresConnection = {};

  if (client === 'postgres' && env('DATABASE_URL')) {
    // Caso A: Usando la URL de conexión (Tu caso con Supabase)
    const config = parse(env('DATABASE_URL'));
    
    postgresConnection = {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      schema: env('DATABASE_SCHEMA', 'public'), // <--- AGREGADO: Importante para estabilidad
      ssl: {
        rejectUnauthorized: false, // Necesario para la conexión segura a Supabase
      },
    };
  } else {
    // Caso B: Variables individuales (Host, Port, User separados)
    postgresConnection = {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'strapi'),
      ssl: env.bool('DATABASE_SSL', false),
      schema: env('DATABASE_SCHEMA', 'public'),
    };
  }

  const connections = {
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
    postgres: {
      connection: postgresConnection,
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),
        max: env.int('DATABASE_POOL_MAX', 10),
      },
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};