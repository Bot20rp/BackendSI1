import {Router} from "express";
import { getLote,createLote,updateLote,deleteLote ,getLotes} from "../controllers/lote.controllers.js";
import { verifyToken1 } from "../../AdministrarUsuario/controllers/auth.controllers.js";
const router=Router();

router.get('/lote',getLote)
router.get('/lotes',getLotes)
router.post('/lote',verifyToken1,createLote)
router.patch('/updLote',verifyToken1,updateLote)
// router.delete('/delLote',deleteLote)
export default router
