import { Usuario, Documento, Telefono, DetalleDocumento ,Empleado} from '../models/AsociacionDocumento.js';
import Rol from '../models/Rol.js';
import Administrador from "../models/Administrador.js";
import Cliente from '../models/Cliente.js';
import { createBitacora } from './bitacora.controllers.js';
import jwt from 'jsonwebtoken';


export const obtenerUsuariosConDetalles= async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['UsuarioID', 'Nombre', 'Correo', 'Sexo','FechaNacimiento'], // Incluyendo el UsuarioID
      where:{Estado:true},
      include: [
        {
          model: DetalleDocumento,
          as: 'DetalleDocumentos',
          attributes: ['NumeroDocumento'],
          include: [
            {
              model: Documento,
              as: 'Documento',
              attributes: ['TipoDocumento'],
            }
          ]
        },
        {
          model: Telefono,
          as: 'Telefonos',
          attributes: ['Nro']
        },
        {
          model: Rol,
          as: 'Rol',
          attributes: ['Nombre']
        },
        {
          model: Empleado,  // Relación con Empleado
          as: 'Empleado',
          attributes: ['Salario', 'HorarioInicio','HorarioFin'] // Atributos de la tabla Empleado
        }
      ]
    });

    // Convertir los datos al formato requerido
    const usuariosFormateados = usuarios.map(usuario => ({
      id: usuario.UsuarioID,  // Usar el UsuarioID como id
      usuario: usuario.Nombre,
      correo: usuario.Correo,
      telefono: usuario.Telefonos[0]?.Nro || 'No registrado',  // Si no tiene teléfono, mostrar un mensaje por defecto
      genero: usuario.Sexo === 'M' ? 'Masculino' : 'Femenino',  // Convertir "Sexo" a "Masculino" o "Femenino"
      rol: usuario.Rol?.Nombre || 'No asignado',  // Mostrar rol, o "No asignado" si no existe
      salario: usuario.Empleado?.Salario || 'No registrado',  // Mostrar salario o 'No registrado'
      horarioInicio: usuario.Empleado?.HorarioInicio || 'No registrado' ,// Mostrar horario laboral o 'No registrado'
      horarioFin: usuario.Empleado?.HorarioFin || 'No registrado',// Mostrar horario laboral o 'No registrado'
      fechaNacimiento: usuario.FechaNacimiento ,// Mostrar horario laboral o 'No registrado'
      ci: usuario.DetalleDocumentos && usuario.DetalleDocumentos[0] ? usuario.DetalleDocumentos[0].NumeroDocumento : 'No registrado', // Validación de existencia
      nit: usuario.DetalleDocumentos && usuario.DetalleDocumentos[1] ? usuario.DetalleDocumentos[1].NumeroDocumento : 'No registrado', // Validación de existencia
    }));

    res.status(200).json({
      message: 'Usuarios obtenidos exitosamente',
      usuarios: usuariosFormateados
    });
  } catch (error) {
    console.error('Error details:', error); // Agregar detalles del error
    res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
}
};

export const updateUsuarioG=async (req,res)=>{
  console.log(req.body)
  const {id,usuario,correo,genero,telefono,fechaNacimiento,salario,horarioInicio,horarioFin,rol}=req.body.data;
  try {
    let message = '';
    const generoAbreviado = genero === "Masculino" ? "M" : genero === "Femenino" ? "F" : null;

       if(rol==="Administrador"){
           let existAdmin=await Administrador.findByPk(Number(id))
           if(!existAdmin){
              //  return res.status(404).json({msg:"No encontrado"})
              existAdmin=await Administrador.create({AdministradorID:id})
           }
           await Usuario.update({
               Nombre: usuario || existAdmin.Nombre,  
               Correo: correo || existAdmin.Correo,
               sexo:generoAbreviado || existAdmin.sexo,
               FechaNacimiento: fechaNacimiento || existAdmin.FechaNacimiento,
               RolID:1
           },{where:{
               UsuarioID:existAdmin.AdministradorID
           }})

           message = `Administrador actualizado: ${usuario} (${correo})`;
           const miTelefono=await Telefono.findOne({where:{UsuarioID:Number(id)}})
           await Telefono.update({
               Nro:telefono || miTelefono.Nro 
           },{where:{UsuarioID:Number(id)}})
           return res.status(200).json({msg:"Actualizacion Correcta"})
       }


       if(rol==="Empleado"){
        let existEmple=await Empleado.findByPk(Number(id))
        if(!existEmple){
            // return res.status(404).json({msg:"No encontrado"})
            existEmple=await Empleado.create({EmpleadoID:id,Salario:Number(salario),
              HorarioInicio:horarioInicio,
              HorarioFin:horarioFin})
            
        }

        console.log("si hay")
        await Usuario.update({
            Nombre: usuario || existEmple.Nombre,  
            Correo: correo || existEmple.Correo,
            sexo:generoAbreviado || existEmple.sexo,
            FechaNacimiento: fechaNacimiento || existEmple.FechaNacimiento,
            RolID:2
        },{
            where:{
                UsuarioID:existEmple.EmpleadoID
            }
        })

        await Empleado.update({
            Salario:Number(salario)|| existEmple.Salario,
            HorarioInicio:horarioInicio ||existEmple.HorarioInicio,
            HorarioFin:horarioFin || existEmple.HorarioFin
        },{
            where:{
                EmpleadoID:existEmple.EmpleadoID
            }
        })

        message = `Empleado actualizado: ${usuario} (${correo})`;

        const miTelefono=await Telefono.findOne({where:{UsuarioID:Number(id)}})
        await Telefono.update({
            Nro:telefono || miTelefono.Nro 
        },{where:{UsuarioID:Number(id)}})
        return res.status(200).json({msg:"Actualizacion Correcta"})
    }


      
    if(rol==="Cliente"){
      let existCli=await Cliente.findByPk(Number(id))
      if(!existCli){
        console.log("eorr")
          // return res.status(404).json({msg:"No encontrado"})
          existCli=await Cliente.create({ClienteID:id})
      }
      console.log("aqui toy")
      await Usuario.update({
          Nombre: usuario || existCli.Nombre,  // si no se envia mantiene el valor actual 
          Correo: correo || existCli.Correo,
          sexo:generoAbreviado || existCli.sexo,
          FechaNacimiento: fechaNacimiento || existCli.FechaNacimiento,
          RolID:3
      },{
          where:{
              UsuarioID:existCli.ClienteID
          }
      })

      message = `Cliente actualizado: ${usuario} (${correo})`;

      const miTelefono=await Telefono.findOne({where:{UsuarioID:Number(id)}})
      await Telefono.update({
          Nro:telefono || miTelefono.Nro 
      },{where:{UsuarioID:Number(id)}})
      return res.status(200).json({msg:"Actualizacion Correcta"})
  }
  await createBitacora({ UsuarioID: req.user.id, message }, res);
  } catch (error) {
      res.status(500).json({msg:error.message})
  }
};

export const deleteUsuarioG=async (req,res)=>{
  console.log(req.body.data)
  const {id}=req.body.data
  try{
      const infoUser= await Usuario.findByPk(Number(id));
      if(infoUser.RolID==1){
        //  await Administrador.destroy({where:{ AdministradorID:infoUser.UsuarioID}});
        //  await Telefono.destroy({where:{UsuarioID:infoUser.UsuarioID}})
        //  await DetalleDocumento.destroy({where:{UsuarioID:infoUser.UsuarioID}})
        // await Usuario.destroy({where:{UsuarioID:infoUser.UsuarioID}})
         await infoUser.update({Estado:false})
         await Bitacora.create({
          UsuarioID: id,
          Accion: 'Eliminar Usuario',
          Fecha: new Date(),
          Detalles: `Usuario con ID ${id} (Rol: Administrador) ha sido desactivado.`
        });
         return res.status(200).json({msj:"Eliminacion exitosa"})
      }

       if(infoUser.RolID==2){
          // await Empleado.destroy({where:{ EmpleadoID:infoUser.UsuarioID}});
          // await Telefono.destroy({where:{UsuarioID:infoUser.UsuarioID}})
          // await DetalleDocumento.destroy({where:{UsuarioID:infoUser.UsuarioID}})
          // await Usuario.destroy({where:{UsuarioID:infoUser.UsuarioID}})
          await infoUser.update({Estado:false})

          await Bitacora.create({
            UsuarioID: id,
            Accion: 'Eliminar Usuario',
            Fecha: new Date(),
            Detalles: `Usuario con ID ${id} (Rol: Empleado) ha sido desactivado.`
          });
    
          return res.status(200).json({msj:"Eliminacion exitosa"})
       }

       if(infoUser.RolID==3){
        // await Cliente.destroy({where:{ ClienteID:infoUser.UsuarioID}});
        // await Telefono.destroy({where:{UsuarioID:infoUser.UsuarioID}})
        // await DetalleDocumento.destroy({where:{UsuarioID:infoUser.UsuarioID}})
        // await Usuario.destroy({where:{UsuarioID:infoUser.UsuarioID}})
        await infoUser.update({Estado:false})

        await Bitacora.create({
          UsuarioID: id,
          Accion: 'Eliminar Usuario',
          Fecha: new Date(),
          Detalles: `Usuario con ID ${id} (Rol: Cliente) ha sido desactivado.`
        });

        return res.status(200).json({msj:"Eliminacion exitosa"})
     }
  }catch(error){
      res.status(500).json({err:error.message})
  }
};

export const actualizarDatosUsuario = async (req, res) => {
  try {
      const { id } = req.user; // Obtenemos el ID del usuario desde el middleware
      const { direccion, correo, telefono } = req.body; // Datos enviados en el cuerpo de la solicitud

      // Validar que al menos uno de los campos esté presente
      if (!direccion && !correo && !telefono) {
          return res.status(400).json({ mensaje: "Debes proporcionar al menos un dato para actualizar (dirección, correo o teléfono)." });
      }

      // Actualizar los datos en la tabla Cliente (para dirección)
      if (direccion) {
          const clienteActualizado = await Cliente.update(
              { Direccion: direccion },
              { where: { UsuarioID: id } }
          );
          if (!clienteActualizado) {
              return res.status(500).json({ mensaje: "No se pudo actualizar la dirección." });
          }
      }

      // Actualizar los datos en la tabla Usuario (para correo y teléfono)
      const datosUsuario = {};
      if (correo) datosUsuario.Correo = correo;
      if (telefono) datosUsuario.Telefono = telefono;

      if (Object.keys(datosUsuario).length > 0) {
          const usuarioActualizado = await Usuario.update(
              datosUsuario,
              { where: { UsuarioID: id } }
          );
          if (!usuarioActualizado) {
              return res.status(500).json({ mensaje: "No se pudo actualizar el correo o teléfono." });
          }
      }

      res.json({ mensaje: "Datos actualizados correctamente." });
  } catch (error) {
      console.error("Error en actualizarDatosUsuario:", error);
      res.status(500).json({ mensaje: "Error en el servidor." });
  }
};

