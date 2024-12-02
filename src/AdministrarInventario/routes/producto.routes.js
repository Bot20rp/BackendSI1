import { Router } from "express";
import { fileUpload } from "../../middleware/image.js";
import { verifyToken1 } from "../../AdministrarUsuario/controllers/auth.controllers.js";
import { registrarProducto,getProducto,updateProducto,deleteproducto,registerProducto,updateProducto1} from "../controllers/productos.controlles.js";
const router=Router();


router.get('/producto',getProducto)
// router.get('/producto',getProductoByID)
router.post('/productoReg',fileUpload,verifyToken1,registerProducto)
router.patch('/producto/actualizar',fileUpload,verifyToken1,updateProducto1)
router.delete('/producto/delete',deleteproducto)
export default  router;