import path from 'path';
import dns from 'dns'; // <--- 1. Importamos el módulo DNS
import pgConnectionString from 'pg-connection-string';

const { parse } = pgConnectionString;

// <--- 2. FORZAMOS A NODE A USAR IPV4 AQUI MISMO
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  let postgresConnection = {};

  if (client === 'postgres' && env('DATABASE_URL')) {
    const config = parse(env('DATABASE_URL'));
    postgresConnection = {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: {
        rejectUnauthorized: false,
      },
    };
  } else {
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