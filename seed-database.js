import { db } from './src/config/dbConfig.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // Asegúrate de tener bcryptjs instalado

// Cargar variables de entorno
dotenv.config();

// Importar modelos necesarios
import Rol from './src/AdministrarUsuario/models/Rol.js';
import Usuario from './src/AdministrarUsuario/models/Usuario.js';
import Administrador from './src/AdministrarUsuario/models/Administrador.js';
import Documento from './src/AdministrarUsuario/models/Documento.js';
import TipoPago from './src/Venta/models/TipoPago.js';
import TipoVenta from './src/Venta/models/TipoVenta.js';
import Categoria from './src/AdministrarInventario/models/Categoria.js';
import Marca from './src/AdministrarInventario/models/Marca.js';
import Estante from './src/AdministrarInventario/models/Estante.js';
import Volumen from './src/AdministrarInventario/models/Volumen.js';

// Función para extraer información de DATABASE_URL
function getDatabaseInfo() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      return {
        database: url.pathname.substring(1),
        host: url.hostname,
        user: url.username
      };
    } catch (error) {
      return {
        database: 'Base de datos de producción',
        host: 'Render PostgreSQL',
        user: 'Usuario de producción'
      };
    }
  } else {
    return {
      database: process.env.DB_NAME || 'Base de datos local',
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres'
    };
  }
}

// Datos esenciales a insertar
const datosEsenciales = {
  roles: [
    { Nombre: 'Administrador' },
    { Nombre: 'Empleado' },
    { Nombre: 'Cliente' },
    { Nombre: 'Proveedor' }
  ],

  documentos: [
    { TipoDocumento: 'Cédula de Identidad' },
    { TipoDocumento: 'NIT' },
    { TipoDocumento: 'Pasaporte' },
    { TipoDocumento: 'Licencia de Conducir' }
  ],

  tiposPago: [
    { Nombre: 'Efectivo' },
    { Nombre: 'Tarjeta de Débito' },
    { Nombre: 'Tarjeta de Crédito' },
    { Nombre: 'QR' },
    { Nombre: 'Transferencia Bancaria' }
  ],

  tiposVenta: [
    { Nombre: 'Venta Directa' },
    { Nombre: 'Venta Online' },
    { Nombre: 'Pedido Especial' },
    { Nombre: 'Delivery' }
  ],

  categorias: [
    { CategoriaID: 1, Nombre: 'Bebidas Alcohólicas', CategoriaPadreID: null },
    { CategoriaID: 2, Nombre: 'Vinos', CategoriaPadreID: 1 },
    { CategoriaID: 3, Nombre: 'Cervezas', CategoriaPadreID: 1 },
    { CategoriaID: 4, Nombre: 'Licores', CategoriaPadreID: 1 },
    { CategoriaID: 5, Nombre: 'Whisky', CategoriaPadreID: 4 },
    { CategoriaID: 6, Nombre: 'Ron', CategoriaPadreID: 4 },
    { CategoriaID: 7, Nombre: 'Vodka', CategoriaPadreID: 4 },
    { CategoriaID: 8, Nombre: 'Bebidas sin Alcohol', CategoriaPadreID: null },
    { CategoriaID: 9, Nombre: 'Refrescos', CategoriaPadreID: 8 },
    { CategoriaID: 10, Nombre: 'Jugos', CategoriaPadreID: 8 }
  ],

  marcas: [
    { Nombre: 'Corona', Region: 'México', Descripcion: 'Cerveza premium mexicana' },
    { Nombre: 'Paceña', Region: 'Bolivia', Descripcion: 'Cerveza nacional boliviana' },
    { Nombre: 'Huari', Region: 'Bolivia', Descripcion: 'Cerveza artesanal boliviana' },
    { Nombre: 'Johnnie Walker', Region: 'Escocia', Descripcion: 'Whisky escocés premium' },
    { Nombre: 'Bacardi', Region: 'Puerto Rico', Descripcion: 'Ron caribeño de calidad' },
    { Nombre: 'Smirnoff', Region: 'Reino Unido', Descripcion: 'Vodka premium internacional' },
    { Nombre: 'Coca Cola', Region: 'Estados Unidos', Descripcion: 'Bebida gaseosa mundial' },
    { Nombre: 'Fanta', Region: 'Alemania', Descripcion: 'Refresco de frutas' }
  ],

  estantes: [
    { Nombre: 'Estante A1', Ubicacion: 'Zona Cervezas' },
    { Nombre: 'Estante A2', Ubicacion: 'Zona Cervezas' },
    { Nombre: 'Estante B1', Ubicacion: 'Zona Vinos' },
    { Nombre: 'Estante B2', Ubicacion: 'Zona Vinos' },
    { Nombre: 'Estante C1', Ubicacion: 'Zona Licores' },
    { Nombre: 'Estante C2', Ubicacion: 'Zona Licores' },
    { Nombre: 'Estante D1', Ubicacion: 'Zona Sin Alcohol' },
    { Nombre: 'Estante D2', Ubicacion: 'Zona Sin Alcohol' }
  ],

  volumenes: [
    { Descripcion: '330ml' },
    { Descripcion: '500ml' },
    { Descripcion: '750ml' },
    { Descripcion: '1L' },
    { Descripcion: '1.5L' },
    { Descripcion: '2L' },
    { Descripcion: '355ml' },
    { Descripcion: '473ml' }
  ]
};

async function poblarDatosEsenciales() {
  try {
    console.log('🌱 Iniciando poblado de datos esenciales...');

    // Verificar conexión
    await db.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Mostrar información de la base de datos
    const dbInfo = getDatabaseInfo();
    console.log(`📊 Base de datos: ${dbInfo.database}`);
    console.log(`🏠 Host: ${dbInfo.host}`);
    console.log(`👤 Usuario: ${dbInfo.user}`);
    
    // Verificar entorno
    const isProduction = process.env.NODE_ENV === 'production';
    console.log(`🌍 Entorno: ${isProduction ? 'Producción' : 'Desarrollo'}`);

    // 1. Poblar Roles
    console.log('📝 Poblando Roles...');
    for (const rol of datosEsenciales.roles) {
      await Rol.findOrCreate({
        where: { Nombre: rol.Nombre },
        defaults: rol
      });
    }
    console.log('✅ Roles poblados correctamente');

    // 2. Poblar Documentos
    console.log('📄 Poblando Tipos de Documento...');
    for (const doc of datosEsenciales.documentos) {
      await Documento.findOrCreate({
        where: { TipoDocumento: doc.TipoDocumento },
        defaults: doc
      });
    }
    console.log('✅ Tipos de Documento poblados correctamente');

    // 3. Poblar Tipos de Pago
    console.log('💳 Poblando Tipos de Pago...');
    for (const tipoPago of datosEsenciales.tiposPago) {
      await TipoPago.findOrCreate({
        where: { Nombre: tipoPago.Nombre },
        defaults: tipoPago
      });
    }
    console.log('✅ Tipos de Pago poblados correctamente');

    // 4. Poblar Tipos de Venta
    console.log('🛒 Poblando Tipos de Venta...');
    for (const tipoVenta of datosEsenciales.tiposVenta) {
      await TipoVenta.findOrCreate({
        where: { Nombre: tipoVenta.Nombre },
        defaults: tipoVenta
      });
    }
    console.log('✅ Tipos de Venta poblados correctamente');

    // 5. Poblar Categorías
    console.log('📂 Poblando Categorías...');
    for (const categoria of datosEsenciales.categorias) {
      await Categoria.findOrCreate({
        where: { CategoriaID: categoria.CategoriaID },
        defaults: categoria
      });
    }
    console.log('✅ Categorías pobladas correctamente');

    // 6. Poblar Marcas
    console.log('🏷️ Poblando Marcas...');
    for (const marca of datosEsenciales.marcas) {
      await Marca.findOrCreate({
        where: { Nombre: marca.Nombre },
        defaults: marca
      });
    }
    console.log('✅ Marcas pobladas correctamente');

    // 7. Poblar Estantes
    console.log('📦 Poblando Estantes...');
    for (const estante of datosEsenciales.estantes) {
      await Estante.findOrCreate({
        where: { Nombre: estante.Nombre },
        defaults: estante
      });
    }
    console.log('✅ Estantes poblados correctamente');

    // 8. Poblar Volúmenes
    console.log('📏 Poblando Volúmenes...');
    for (const volumen of datosEsenciales.volumenes) {
      await Volumen.findOrCreate({
        where: { Descripcion: volumen.Descripcion },
        defaults: volumen
      });
    }
    console.log('✅ Volúmenes poblados correctamente');

    // 9. CREAR ADMINISTRADOR POR DEFECTO
    console.log('👤 Creando Administrador por defecto...');
    
    // Buscar el rol de Administrador
    const rolAdmin = await Rol.findOne({ where: { Nombre: 'Administrador' } });
    
    if (rolAdmin) {
      // Encriptar contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('admin', saltRounds);
      
      // Crear usuario administrador
      const [adminUser, createdUser] = await Usuario.findOrCreate({
        where: { Correo: 'admin@gmail.com' },
        defaults: {
          Nombre: 'Administrador',
          Correo: 'admin@gmail.com',
          Contrasena: hashedPassword,
          sexo: 'M',
          FechaNacimiento: new Date('1990-01-01'),
          RolID: rolAdmin.RolID,
          Estado: true
        }
      });

      if (createdUser) {
        console.log('✅ Usuario administrador creado');
        
        // Crear registro en tabla Administrador
        await Administrador.findOrCreate({
          where: { AdministradorID: adminUser.UsuarioID },
          defaults: {
            AdministradorID: adminUser.UsuarioID
          }
        });
        
        console.log('✅ Registro de Administrador creado');
      } else {
        console.log('ℹ️ Usuario administrador ya existe');
      }
    } else {
      console.log('❌ No se encontró el rol de Administrador');
    }

    console.log('🎉 ¡Todos los datos esenciales han sido poblados correctamente!');
    
    // Mostrar resumen
    const resumen = {
      roles: await Rol.count(),
      documentos: await Documento.count(),
      tiposPago: await TipoPago.count(),
      tiposVenta: await TipoVenta.count(),
      categorias: await Categoria.count(),
      marcas: await Marca.count(),
      estantes: await Estante.count(),
      volumenes: await Volumen.count(),
      usuarios: await Usuario.count(),
      administradores: await Administrador.count()
    };

    console.log('\n📊 Resumen de datos poblados:');
    console.log(`  - Roles: ${resumen.roles}`);
    console.log(`  - Tipos de Documento: ${resumen.documentos}`);
    console.log(`  - Tipos de Pago: ${resumen.tiposPago}`);
    console.log(`  - Tipos de Venta: ${resumen.tiposVenta}`);
    console.log(`  - Categorías: ${resumen.categorias}`);
    console.log(`  - Marcas: ${resumen.marcas}`);
    console.log(`  - Estantes: ${resumen.estantes}`);
    console.log(`  - Volúmenes: ${resumen.volumenes}`);
    console.log(`  - Usuarios: ${resumen.usuarios}`);
    console.log(`  - Administradores: ${resumen.administradores}`);

    console.log('\n🔑 Credenciales del administrador:');
    console.log('  - Email: admin@gmail.com');
    console.log('  - Contraseña: admin');

  } catch (error) {
    console.error('❌ Error al poblar datos esenciales:', error);
  } finally {
    await db.close();
  }
}

poblarDatosEsenciales();