const { Pool } = require('pg');
require('dotenv').config();

const config = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // VITAL para Neon
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
      };

const pool = new Pool(config);

// ESTO ES EL DIAGNÓSTICO:
pool.connect()
    .then(() => console.log(" ¡EXITO! CONECTADO A LA BASE DE DATOS"))
    .catch(err => console.error("ERROR FATAL DE CONEXIÓN:", err.message));

module.exports = pool;