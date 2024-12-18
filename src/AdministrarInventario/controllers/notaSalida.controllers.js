import NotaSalida from "../models/NotaSalida.js";
import TipoSalida from "../models/TipoSalida.js";
import SalidaProducto from "../models/SalidaProducto.js";
import Suministro from "../models/Suministro.js";
import Producto from "../models/Producto.js";

// obtiene los tipos de salida 
export const getTipoSalida=async (req,res)=>{
    try {
        const tipoSalida= await TipoSalida.findAll();
        res.status(200).json(tipoSalida);
    } catch (error) {
        res.status(500).json({err:error.message})
    }
}

//implementacion para nota de salidas
export const registrarNotaSalida=async (req,res)=>{
    console.log(req.body.data)
    const {TipoSalidaID,Fecha,productos}=req.body.data
    try {
        if(!TipoSalidaID || !Fecha || !Array.isArray(productos)|| !productos.length>0){
            return res.status(400).json({ message: 'Todos los campos son obligatorios, incluyendo al menos un producto.' });
        }
        const notaSalida=await NotaSalida.create({TipoSalidaID,Fecha})
        const detalleSalidaProducto=productos.map((producto)=>({
            ...producto,NotaSalidaID:notaSalida.NotaSalidaID
        }))

        for(const producto of detalleSalidaProducto){
            const {cantidad,id,NotaSalidaID}=producto;
            const existeProducto=await Producto.findByPk(parseInt(id))
            if(!existeProducto) continue;

            const suministro= await  Suministro.findOne({where :{ProductoID:parseInt(id)}})
            if(!suministro || !suministro.CantidadSaldo>=parseInt(cantidad)){
                return res.status(404).json({msg:"Producto no encontrado o cantidad insuficiente"})
            }
            await SalidaProducto.create({NotaSalidaID,ProductoID:id,Cantidad:cantidad});
            suministro.CantidadSaldo -=parseInt(cantidad);
            await suministro.save();
                    
        }
        res.status(200).json({msg:"Nota salida registrada"})
    } catch (error) {
        res.status(500).json({err:error.message})
    }
}

