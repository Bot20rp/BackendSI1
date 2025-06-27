import { db } from './src/config/dbConfig.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// ✅ IMPORTAR TODOS LOS MODELOS CON LAS RUTAS CORRECTAS
// Modelos de Usuario
import Rol from './src/AdministrarUsuario/models/Rol.js';
import Usuario from './src/AdministrarUsuario/models/Usuario.js';
import Documento from './src/AdministrarUsuario/models/Documento.js';
import Telefono from './src/AdministrarUsuario/models/Telefono.js';
import DetalleDocumento from './src/AdministrarUsuario/models/DetalleDocumento.js';
import Empleado from './src/AdministrarUsuario/models/Empleado.js';
import Cliente from './src/AdministrarUsuario/models/Cliente.js';
import Administrador from './src/AdministrarUsuario/models/Administrador.js';
import Bitacora from './src/AdministrarUsuario/models/Bitacora.js';
import Permisos from './src/AdministrarUsuario/models/Permisos.js';
import Privilegio from './src/AdministrarUsuario/models/Privilegio.js';  // ✅ AGREGAR ESTA LÍNEA

// Modelos de Inventario
import Producto from './src/AdministrarInventario/models/Producto.js';
import Marca from './src/AdministrarInventario/models/Marca.js';
import Estante from './src/AdministrarInventario/models/Estante.js';
import Categoria from './src/AdministrarInventario/models/Categoria.js';
import Volumen from './src/AdministrarInventario/models/Volumen.js';
import CantidadVolumen from './src/AdministrarInventario/models/CantidadVolumen.js';
import Suministro from './src/AdministrarInventario/models/Suministro.js';
import Almacenamiento from './src/AdministrarInventario/models/Almacenamiento.js';
import NotaSalida from './src/AdministrarInventario/models/NotaSalida.js';
import SalidaProducto from './src/AdministrarInventario/models/SalidaProducto.js';
import TipoSalida from './src/AdministrarInventario/models/TipoSalida.js';

// Modelos de Compra
import Proveedor from './src/Compra/models/Proveedor.js';
import FacturaCompra from './src/Compra/models/FacturaCompra.js';
import Lote from './src/Compra/models/Lote.js';

// Modelos de Venta (✅ AQUÍ ESTABA EL ERROR)
import Factura from './src/Venta/models/Factura.js';
import NotaVenta from './src/Venta/models/NotaVenta.js';
import DetalleVenta from './src/Venta/models/DetalleVenta.js';
import TipoVenta from './src/Venta/models/TipoVenta.js';
import VentaCombo from './src/Venta/models/VentaCombo.js';
import TipoPago from './src/Venta/models/TipoPago.js';
import Transaccion from './src/Venta/models/Transaccion.js';
import Apertura from './src/Venta/models/Apertura.js';
import Combo from './src/Venta/models/Combo.js';  // ✅ ESTABA EN VENTA, NO EN INVENTARIO
import DetalleCombo from './src/Venta/models/DetalleCombo.js';  // ✅ TAMBIÉN EN VENTA
import Pedidos from './src/Venta/models/Pedidos.js';
import MetodoEntrega from './src/Venta/models/MetodoEntrega.js';

// Importar asociaciones (esto es importante)
import './src/AdministrarUsuario/models/AsociacionDocumento.js';

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
    console.log(`📦 Modelos importados: ${Object.keys(db.models).length}`);
    
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
    
    if (results.length === 0) {
      console.log('⚠️  No se crearon tablas. Verificando modelos...');
      console.log('📦 Modelos disponibles:', Object.keys(db.models));
    }
    
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