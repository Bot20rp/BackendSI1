import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const db = new Sequelize(
  process.env.DB_NAME || 'Licoreria',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'mcangel03',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres', 
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: process.env.TIME_ZONE || 'America/La_Paz',
    dialectOptions: {
      timezone: 'local',
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Función para conectar a la base de datos
async function rundb() {
  try {
    await db.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
  }
}

export default rundb;
