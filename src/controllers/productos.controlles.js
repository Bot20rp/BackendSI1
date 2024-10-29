import producto, { createProducto, obtProducto, actProducto } from "../models/Producto.js";


export const registrarProducto = async (req, res) => {
    // const {Nombre,Precio,Volumen,Marca,Estante,CategoriaID}=req.body
    console.log(req.body)
    try {
        const produc = await createProducto(req.body.data)
        res.status(200).json({ msj: "siuuuuu" })
    } catch (error) {
        res.status(500).json({ err: error.message })
    }
}

export const getProducto = async (req, res) => {
    // const {Nombre,Precio,MarcaID,Estante,Categoria,Volumen}=req.body
    console.log(req.body)
    try {
        const productos = await obtProducto()
        res.status(200).json(productos)
    } catch (error) {
        res.status(500).json({ err: error.message })
    }
}

export const updateProducto = async (req, res) => {
    console.log(req.body.data)
    try {
        const productos = await actProducto(req.body.data)
        res.status(200).json({ msg: "ACtualizacion exitosa" })
    } catch (error) {
        res.status(500).json({ err: error.message })
    }
}

export const deleteproducto = async (req, res) => {
    try {
        console.log(req.body.data);
        const { id } = req.body.data;
        const existProd = producto.findOne({ where: { ProductoID: Number(id) } })
        if (!existProd) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }
        console.log("esty aqui");
        await existProd.update({Estado:false})
        console.log("esty aqui 2");
        res.status(200).json({msg:"Producto eliminado exitosamente"})
    } catch (error) {

    }
}