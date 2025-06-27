import { db } from './src/config/dbConfig.js';

// Importar todos tus modelos para que se registren
import './src/AdministrarUsuario/models/AsociacionDocumento.js';

async function syncDatabase() {
  try {
    console.log('🔄 Conectando a PostgreSQL...');
    
    // Verificar conexión
    await db.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida');
    console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
    console.log(`🏠 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    
    // Sincronizar modelos con la base de datos
    console.log('🔄 Sincronizando modelos...');
    await db.sync({ alter: true }); // Cambiar a { force: true } si quieres recrear todo
    console.log('✅ Tablas sincronizadas correctamente');
    
    // Mostrar tablas creadas
    const [results] = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Tablas creadas:');
    results.forEach(row => console.log(`  - ${row.table_name}`));
    
  } catch (error) {
    console.error('❌ Error al sincronizar base de datos:', error);
  } finally {
    await db.close();
  }
}

syncDatabase();