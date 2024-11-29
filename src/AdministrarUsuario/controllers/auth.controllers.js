import { where } from 'sequelize';
import usuario from '../models/Usuario.js';
import Documento from '../models/Documento.js';
import DetalleDocumento from '../models/DetalleDocumento.js';
import telefono from '../models/Telefono.js';
import cliente from '../models/Cliente.js';
import bcrypt from 'bcryptjs'; // Asegúrate de que este sea el nombre correcto
import { createAccesToken } from '../../libs/tokens.js';
import jwt from 'jsonwebtoken'
import Rol from '../models/Rol.js';
import { createBitacora } from './bitacora.controllers.js';
import { obtenerPermisosXRol } from '../models/Permisos.js';

export const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        console.log(usuario.associations);
        const existUser = await usuario.findOne({ 
            where: { Correo: email },
            attributes: ['UsuarioID','Nombre', 'Correo', 'Contrasena', 'RolID', 'Sexo', 'FechaNacimiento'], 
            include: [
                { model: Rol, attributes: ['Nombre'] }, 
                { 
                    model: DetalleDocumento, 
                    as:'DetalleDocumentos',
                    attributes: ['NumeroDocumento'], 
                    include: { 
                        model: Documento, 
                        as:'Documento',
                        attributes: ['TipoDocumento'] 
                    }
                },
                { 
                    model: telefono, 
                    as:'Telefonos',
                    attributes: ['Nro'] 
                },
                { 
                    model: cliente, 
                    attributes: ['Direccion']
                }
            ]
        });
        if (!existUser) {
            return res.status(401).json({ mensaje: 'Ese usuario no existe' });
        }
        if (!bcrypt.compareSync(password, existUser.Contrasena)) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
        }
        const token = await createAccesToken({ id: existUser.UsuarioID });
        const permisos = await obtenerPermisosXRol(existUser.RolID);
        const documentos = existUser.DetalleDocumentos.map((doc) => {
            return { 
                tipo: doc.Documento.TipoDocumento, 
                numero: doc.NumeroDocumento 
            };
        });
        const ci = documentos.find(doc => doc.tipo === 'Cédula de Identidad')?.numero || null;
        const nit = documentos.find(doc => doc.tipo === 'NIT')?.numero || null;
        res.json({
            message: "Inicio de sesión exitoso",
            token,
            user: {
                id: existUser.UsuarioID,
                nombre:existUser.Nombre,
                email: existUser.Correo,
                rol: existUser.Rol.Nombre,
                permisos,
                genero: existUser.Sexo,
                fechaNacimiento: existUser.FechaNacimiento,
                direccion: existUser.cliente?.Direccion || null,
                telefono: existUser.Telefonos?.[0]?.Nro || null,
                ci,
                nit
            }
        });
        const message = "Inicio de sesión";
        const UsuarioID = existUser.UsuarioID;
        await createBitacora({ UsuarioID, message }, res);    
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};


export const logout = async (req,res) => {
    const message="Cerrar Sesion"
    const UsuarioID=req.user.id;
    await createBitacora({UsuarioID,message},res);
    res.cookie("token", "", {
        httpOnly: true,
        secure: true,
        expires: new Date(0),
      });
      return res.sendStatus(200);
}

export const verifyToken = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Obtiene el token

    if (!token) return res.status(401).json({ message: "Token no proporcionado"});

    jwt.verify(token, process.env.JWT_SECRETO, async (err, user) => {
        if (err) return res.status(403).json({ message: "Token no válido" });

        const existUserToken = await usuario.findOne({
            where: { UsuarioID: user.id },
            attributes: ['UsuarioID', 'Nombre', 'Contrasena','RolID'],
            include: { model: Rol, attributes: ['Nombre'] }  // Cambia 'Nombre' a ['Nombre']
        });

        if (!existUserToken) return res.status(401).json({ message: "Usuario no encontrado" });
        const permisos=await obtenerPermisosXRol(existUserToken.RolID)
        return res.json({
            user: {
                id: existUserToken.UsuarioID,
                email: existUserToken.Nombre,
                rol: existUserToken.Rol.Nombre,
                permisos
            }

        });
    });
};


export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Obtiene el token

    if (!token) return res.status(401).json({ message: "Token no proporcionado" });
    
    jwt.verify(token, process.env.JWT_SECRETO, (err, user) => {
        if (err) return res.sendStatus(403); // Si hay un error, responde con un 403
        req.user = user; // Almacena la información del usuario en req.user
        next(); // Llama al siguiente middleware
    });
};

export const verifyToken1 = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Token no proporcionado" });

    jwt.verify(token, process.env.JWT_SECRETO, async (err, user) => {
        if (err) return res.status(403).json({ message: "Token no válido" });

        const existUserToken = await usuario.findOne({
            where: { UsuarioID: user.id },
            attributes: ['UsuarioID', 'Nombre', 'Contrasena', 'RolID'],
            include: { model: Rol, attributes: ['Nombre'] }
        });

        if (!existUserToken) return res.status(401).json({ message: "Usuario no encontrado" });

        req.user = {
            id: existUserToken.UsuarioID,
            rol: existUserToken.Rol.Nombre,
            permisos: await obtenerPermisosXRol(existUserToken.RolID),
        };

        next(); // Continúa al siguiente middleware o controlador
    });
};
