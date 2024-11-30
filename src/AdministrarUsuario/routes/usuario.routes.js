import {Router} from "express"

import { obtenerUsuariosConDetalles, updateUsuarioG,deleteUsuarioG,actualizarDatosUsuario} from "../controllers/usuario.controllers.js";
import { verifyToken1 ,verifyToken, authenticateToken} from "../controllers/auth.controllers.js";

const router = Router();
// Ruta para registrar un usuario

router.get('/obtener',obtenerUsuariosConDetalles); 
router.patch('/usuario/actualizar',verifyToken1,updateUsuarioG);
router.delete('/usuario/del',verifyToken1,deleteUsuarioG);
router.put('/UpdateDatos',authenticateToken,actualizarDatosUsuario); 
export default router;