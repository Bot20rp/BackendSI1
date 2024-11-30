import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env
dotenv.config({ path: '.env' });


// Crear la conexión a la base de datos
export const db = new Sequelize(
  process.env.DB_NAME || 'Licoreria',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'LdWfvByGlIaMXvYzlozdfGbkdAseyQFf',
  {
    host: process.env.DB_HOST || 'junction.proxy.rlwy.net',
    port: process.env.DB_PORT || 44972,
    dialect: 'mysql',
    dialectOptions: {
      connectTimeout: 60000,  // Aumenta el tiempo de espera a 60 segundos
    },
    define: {
      timestamps: false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Función para autenticar y sincronizar la base de datos
const rundb = async () => {
  try {
    await db.authenticate();
    await db.sync();
    console.log('Conexión establecida con éxito.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};

export default rundb;
