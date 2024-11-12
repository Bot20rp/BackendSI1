import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';

import morgan from "morgan"
import cors from "cors"; 
import router from "./src/routes/auth.routes.js";
import routerCli from "./src/routes/cliente.routes.js";
import rundb from "./src/config/dbConfig.js";
import cookieParser from 'cookie-parser';
import routerUser from "./src/routes/usuario.routes.js";
import routerProv from "./src/routes/proveedor.routes.js";
import routerEmp from "./src/routes/empleado.routes.js";
import routerCat from "./src/routes/categoria.routes.js";
import routerProd from "./src/routes/producto.routes.js";
import routerBit from "./src/routes/bitacora.routes.js";
import routerCombo from "./src/routes/Combo.routes.js";
import routerPerm from "./src/routes/permisos.routes.js";
import routerCompra from "./src/routes/Compras.routes.js"
import routerLote from "./src/routes/lote.routes.js";
import routerRol from "./src/routes/rol.routes.js";
import routerMarca from "./src/routes/marca.routes.js";
import routerEst from "./src/routes/estante.routes.js";
import routerVolu from "./src/routes/volumen.routes.js";
import routerStripe from "./src/routes/stripe.routes.js";
const app = express();
rundb();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/images', express.static(path.join(__dirname, 'src/libs/image')));
app.use(cors({
    origin: 'https://eclectic-fox-653ba4.netlify.app',
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

export default app;