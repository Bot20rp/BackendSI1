import Lote from "../models/Lote.js";
import Producto from "../../AdministrarInventario/models/Producto.js";
import { Sequelize, where } from "sequelize";
import { diasfaltantes } from "../../libs/helpers.js";
import { createBitacora } from '../../AdministrarUsuario/controllers/bitacora.controllers.js';

// en el lote entra unicamente un producto 
export const createLote=async (req,res)=>{
    const UsuarioID = req.user.id;
    try {
        console.log(req.body.data)
        const {data}=req.body//[{},{},{}]
        console.log(data)
        for(const obj of data){
            const {FechaInicio,FechaVencimiento,Cantidad,id}=obj;
            await Lote.create({FechaInicio,FechaExpiracion:FechaVencimiento,Cantidad:Number(Cantidad),ProductoID:id})
        }
        const message = `Lote registrado para múltiples productos`;
        await createBitacora({ UsuarioID, message }, res);

        res.status(200).json({msg:'Lote registrado'})
    } catch (error) {
        res.status(500).json({err:error.message})
    }
}

export const getLote=async (req,res)=>{
    try {
        const lote=await Lote.findAll({attributes:['LoteID','Cantidad','FechaInicio','FechaExpiracion',[Sequelize.col('producto.Nombre'), 'Nombre']],
            where:{Estado:true},
            include:[
                {
                    model:Producto,
                    attributes:[]
                }
            ],
            raw:true
        })
        const agregarNumerodedias=lote.map(obj=>({...obj,dias:`${diasfaltantes(obj.FechaInicio,obj.FechaExpiracion)} d`}))
        res.status(200).json(agregarNumerodedias)
    } catch (error) {
        console.log(error)
        res.status(500).json({err:error.message})
    }
}


export const getLotes = async (req, res) => {
    try {
        // Consulta para obtener los lotes con el nombre del producto
        const lotes = await Lote.findAll({
            attributes: [
                "LoteID",
                "Cantidad",
                "FechaInicio",
                "FechaExpiracion",
                "Estado",
                [Sequelize.col("producto.Nombre"), "NombreProducto"], // Obtener el nombre del producto
            ],
            include: [
                {
                    model: Producto,
                    attributes: [], // No queremos incluir todos los atributos del producto
                },
            ],
            raw: true, // Devuelve resultados como objetos planos
        });

        // Retornar los lotes como respuesta
        res.status(200).json(lotes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


export const deleteLote=async (req,res)=>{
    const UsuarioID = req.user.id;
    try{
        const existe=await Lote.findByPk(Number(req.params.id))
        if(!existe){
            return res.status(404).json({msg:"Lote no encontrado"})
        }
        await existe.update({Estado:false});

         const message = `Lote eliminado con ID: ${req.params.id}`;
         await createBitacora({ UsuarioID, message }, res);

        res.status(201).json({msg:"Lote eliminado"})
    }catch(error){
        res.staus(500).json({err:error.message})
    }
} 

export const updateLote= async (req,res)=>{
    const UsuarioID = req.user.id;
    try {
        const {LoteID,FechaInicio,FechaVencimiento,Cantidad,ProductoID}=req.body
        const existLote=await Lote.findByPk(LoteID);
        if(!existLote){
            return res.status(404).json({msg:"Lote no encontrado"})
        }
        await existLote.update({
            FechaInicio:FechaInicio || existLote.FechaInicio,
            FechaExpiracion:FechaVencimiento || existLote.FechaExpiracion,
            Cantidad:Cantidad || existLote.Cantidad
        })

        const message = `Lote actualizado con ID: ${LoteID}`;
        await createBitacora({ UsuarioID, message }, res);

        res.status(201).json({msg:"Lote Actualizado"})
    } catch (error) {
        res.staus(500).json({err:error.message})
    }
}
