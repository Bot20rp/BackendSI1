import { db } from './src/config/dbConfig.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Función para extraer información de DATABASE_URL
function getDatabaseInfo() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      return {
        database: url.pathname.substring(1), // Quitar el "/"
        host: url.hostname,
        port: url.port || '5432',
        user: url.username
      };
    } catch (error) {
      return {
        database: 'Base de datos de producción',
        host: 'Render PostgreSQL',
        port: '5432',
        user: 'Usuario de producción'
      };
    }
  } else {
    return {
      database: process.env.DB_NAME || 'Base de datos local',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '5432',
      user: process.env.DB_USER || 'postgres'
    };
  }
}

async function syncDatabase() {
  try {
    console.log('🔄 Conectando a PostgreSQL...');
    
    // Probar conexión
    await db.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida');
    
    // Obtener información de la base de datos
    const dbInfo = getDatabaseInfo();
    console.log(`📊 Base de datos: ${dbInfo.database}`);
    console.log(`🏠 Host: ${dbInfo.host}:${dbInfo.port}`);
    console.log(`👤 Usuario: ${dbInfo.user}`);
    
    // Verificar si es producción o desarrollo
    const isProduction = process.env.NODE_ENV === 'production';
    console.log(`🌍 Entorno: ${isProduction ? 'Producción' : 'Desarrollo'}`);
    
    console.log('🔄 Sincronizando modelos...');
    
    // Sincronizar todos los modelos con la base de datos
    await db.sync({ 
      force: false, // No eliminar tablas existentes
      alter: true   // Modificar tablas si hay cambios
    });
    
    console.log('✅ Tablas sincronizadas correctamente');
    
    // Obtener lista de tablas creadas
    const [results] = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('📋 Tablas creadas:');
    results.forEach((table) => {
      console.log(`  - ${table.table_name}`);
    });
    
    console.log(`\n🎉 Total de tablas: ${results.length}`);
    console.log('✅ Sincronización completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error.message);
    console.error('📋 Detalles del error:', error);
  } finally {
    await db.close();
    console.log('🔒 Conexión cerrada');
  }
}

syncDatabase();