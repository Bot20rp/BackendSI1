import { Router } from "express";
import { getRol } from "../controllers/rol.controller.js";
const router = Router();
// Ruta para registrar un usuario

router.get('/obtRol',getRol); 
export default router