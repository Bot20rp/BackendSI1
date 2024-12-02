import Usuario from '../models/Usuario.js';
import Documento from '../models/Documento.js';
import DetalleDocumento from '../models/DetalleDocumento.js';
import bcrypt from 'bcryptjs';
import Telefono from '../models/Telefono.js';
import cliente from '../models/Cliente.js';


export const registrarCliente = async (req, res) => {
  const { Nombre, Correo, Contrasena, FechaNacimiento, Sexo,NIT, CI,telefono,Direccion} = req.body;

  // Validar que todos los campos necesarios estén presentes
  if (!Nombre || !Correo || !Contrasena || !FechaNacimiento || !Sexo || !CI || !telefono ) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(Contrasena, 10);

    // Verificar si el tipo de documento ya existe
    const tipoDocumento = await Documento.findOne({
      where: { TipoDocumento: 'Cédula de Identidad' },
    });

    if (!tipoDocumento) {
      return res.status(400).json({ message: 'El tipo de documento no existe' });
    }

    // Crear el usuario
    const nuevoUsuario = await Usuario.create({
      Nombre,
      Correo,
      Contrasena: hashedPassword,
      FechaNacimiento,
      sexo:Sexo,
      RolID: 3, // Rol de cliente
    });

    // Asociar el número de documento al usuario
    if (CI){
      const tipoDocumentCI= await Documento.findOne({
        where:{tipoDocumento:'Cédula de Identidad'}
    });
    if(tipoDocumentCI){
      await DetalleDocumento.create({
        UsuarioID: nuevoUsuario.UsuarioID, 
        DocumentoID: tipoDocumentCI.DocumentoID,
        NumeroDocumento:CI,
      })
    }else{
      return res.status(400).json({message:'fallo con el tipo de documento cedula'}); 
    }
    }

    if (NIT){
      const tipoDocumentCI= await Documento.findOne({
        where:{tipoDocumento:'NIT'}
    });
    if(tipoDocumentCI){
      await DetalleDocumento.create({
        UsuarioID: nuevoUsuario.UsuarioID, 
        DocumentoID: tipoDocumentCI.DocumentoID,
        NumeroDocumento:NIT,
      })
    }else{
      return res.status(400).json({message:'fallo con el tipo de documento NIT'}); 
    }
    }

    await Telefono.create({
        Nro: telefono,  // Usar el número de teléfono proporcionado
        UsuarioID: nuevoUsuario.UsuarioID,
    });
    
    await cliente.create({ClienteID:nuevoUsuario.UsuarioID,Direccion})
    res.status(201).json({
      message: 'Cliente registrado exitosamente',
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el cliente' });
  }
};