import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';

import morgan from "morgan"
import cors from "cors"; 
import router from "./src/AdministrarUsuario/routes/auth.routes.js";
import routerCli from "./src/AdministrarUsuario/routes/cliente.routes.js";
import rundb from "./src/config/dbConfig.js";
import cookieParser from 'cookie-parser';
import routerUser from "./src/AdministrarUsuario/routes/usuario.routes.js";
import routerProv from "./src/Compra/routes/proveedor.routes.js";
import routerEmp from "./src/AdministrarUsuario/routes/empleado.routes.js";
import routerCat from "./src/AdministrarInventario/routes/categoria.routes.js";
import routerProd from "./src/AdministrarInventario/routes/producto.routes.js";
import routerBit from "./src/AdministrarUsuario/routes/bitacora.routes.js";
import routerCombo from "./src/Venta/routes/Combo.routes.js";
import routerPerm from "./src/AdministrarUsuario/routes/permisos.routes.js";
import routerCompra from "./src/Compra/routes/Compras.routes.js"
import routerLote from "./src/Compra/routes/lote.routes.js";
import routerRol from "./src/AdministrarUsuario/routes/rol.routes.js";
import routerMarca from "./src/AdministrarInventario/routes/marca.routes.js";
import routerEst from "./src/AdministrarInventario/routes/estante.routes.js";
import routerVolu from "./src/AdministrarInventario/routes/volumen.routes.js";
import routerStripe from "./src/Venta/routes/stripe.routes.js";
import routerApertura from "./src/Venta/routes/apertura.routes.js";
import routesVentas from "./src/Venta/routes/ventas.routes.js";
import routerNotaSalida from "./src/AdministrarInventario/routes/NotaSalida.routes.js";
import routerComprobantes from "./src/Venta/routes/Comprobante.routes.js"
import routerDetalleF from "./src/Venta/routes/DetalleF.routes.js"
const app = express();
rundb();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/images', express.static(path.join(__dirname, 'src/libs/image')));
app.use(cors({
    origin: 'https://eclectic-fox-653ba4.netlify.app',
     /* origin:'http://localhost:5173', */
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  }));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use("/api",router);
app.use("/api",routerCli);
app.use("/api",routerUser);
app.use("/api",routerProv);
app.use("/api",routerEmp);
app.use("/api",routerCat);
app.use("/api",routerProd);
app.use("/api",routerBit);
app.use("/api",routerCombo);
app.use("/api",routerPerm);
app.use("/api",routerCompra);
app.use("/api",routerLote)
app.use("/api",routerRol)
app.use("/api",routerMarca)
app.use("/api",routerEst)
app.use("/api",routerVolu)
app.use("/api",routerStripe);
app.use("/api",routerApertura);
app.use("/api",routesVentas)
app.use("/api",routerNotaSalida); 
app.use("/api",routerComprobantes);
app.use("/api",routerDetalleF);


export default app;