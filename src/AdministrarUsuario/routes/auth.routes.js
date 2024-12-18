import { Router } from "express";
import { login,logout,verifyToken,authenticateToken, verifyToken1 ,modificarContraseña, cambiarContrasena} from "../controllers/auth.controllers.js";

const router = Router();

router.post("/login",login);
router.get("/verify",verifyToken);
router.get("/verify1",verifyToken1); 
router.post("/logout",authenticateToken,logout);
router.put("/cambioContra",authenticateToken,cambiarContrasena);
router.patch('/olvContra',modificarContraseña) ;
export default router;