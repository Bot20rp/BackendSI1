import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Esta línea probablemente está mal configurada
const databaseUrl = process.env.DATABASE_URL;

let db;

if (databaseUrl) {
  // Usar DATABASE_URL (Render/Producción)
  db = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false
  });
} else {
  // Usar variables separadas (Local)
  db = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: console.log
    }
  );
}

// Función rundb para sincronizar modelos
const rundb = async () => {
  try {
    await db.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    
    // Mostrar información de la BD
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      const url = new URL(databaseUrl);
      console.log(`📊 Base de datos: ${url.pathname.substring(1)}`);
      console.log(`🏠 Host: ${url.hostname}`);
    } else {
      console.log(`📊 Base de datos: ${process.env.DB_NAME || 'Local'}`);
      console.log(`🏠 Host: ${process.env.DB_HOST || 'localhost'}`);
    }
    
    // NO sincronizar aquí, solo conectar
    // await db.sync({ alter: false, force: false });
    
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error);
  }
};

// Exportar ambos: db y rundb
export { db };
export default rundb;
