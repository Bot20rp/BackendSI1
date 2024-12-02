import producto, { createProducto, obtProducto, actProducto } from "../models/Producto.js";
import CantidadVolumen from "../models/CantidadVolumen.js";
import { createBitacora } from "../../AdministrarUsuario/controllers/bitacora.controllers.js";
import { renombrarImagenes } from "../../libs/helpers.js";
import Volumen from "../models/Volumen.js";


export const registrarProducto = async (req, res) => {
    // const {Nombre,Precio,Volumen,Marca,Estante,CategoriaID}=req.body
    console.log(req.body)
    try {
        const produc = await createProducto(req.body.data)
        await createBitacora({UsuarioID:req.user.id,message:"registro un nuevo producto"},res);
        res.status(200).json({ msj: "siuuuuu" })
    } catch (error) {
        res.status(500).json({ err: error.message })
    }
}


// Función para registrar un producto con sus volúmenes asociados
export const registerProducto = async (req, res) => {
    console.log(req.body.data);
    const { Nombre, Precio, Marca, Estante, Categoria, Volumen } = req.body.data;
    const UsuarioID = req.user.id; // Obtener el ID del usuario logueado

    try {
        // Validar que todos los campos necesarios están presentes
        if (!Nombre || !Precio || !Marca || !Estante || !Categoria || !Volumen) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        // Crear el nuevo producto
        const newProducto = await producto.create({
            Nombre,
            Precio: parseFloat(Precio), // Convertir el precio a número
            MarcaID: parseInt(Marca), // Convertir a número
            EstanteID: parseInt(Estante),
            CategoriaID: parseInt(Categoria),
            Estado: 1 // Estado activo por defecto
        });
        //añadiendo el nombre de la imagen
        const idProd=newProducto.ProductoID;
        const DirImagen=renombrarImagenes(req.file.filename,idProd,"producto_")
        await producto.update({DirImagen},{where :{ProductoID:idProd}})

        // Asociar el volumen con el producto en la tabla intermedia CantidadVolumen
        await CantidadVolumen.create({
            ProductoID: newProducto.ProductoID,
            VolumenID: parseInt(Volumen) // Convertir a número
        });

        // Registrar el evento en la bitácora
        const message = `Producto reg: ${newProducto.ProductoID},Name: ${Nombre}`;
        await createBitacora({ UsuarioID, message });

        res.status(201).json({
            message: 'Producto registrado exitosamente.',
            producto: newProducto
        });
    } catch (error) {
        console.error('Error al registrar el producto:', error);
        res.status(500).json({ message: 'Error al registrar el producto.' });
    }
};


export const getProducto = async (req, res) => {
    // const {Nombre,Precio,MarcaID,Estante,Categoria,Volumen}=req.body
    console.log(req.body)
    try {
        let productos = await obtProducto()
        console.log(productos);
        productos=productos.map((producto)=>({
            ...producto,DirImagen:producto.DirImagen?`${req.protocol}://${req.get('host')}/images/${producto.DirImagen}`:null
        }))
        res.status(200).json(productos)
    } catch (error) {
        res.status(500).json({ err: error.message })
    }
}

export const updateProducto = async (req, res) => {
    console.log(req.body.data)
    try {
        const productos = await actProducto(req.body.data)
        await createBitacora({UsuarioID:req.user.id,message:`actualizo el producto con ID ${req.body.data.id}`},res);
        res.status(200).json({ msg: "ACtualizacion exitosa" })
    } catch (error) {
        res.status(500).json({ err: error.message })
    }
}

export const deleteproducto = async (req, res) => {
    try {
        // Verifica si req.body.data contiene los datos esperados
        console.log(req.body.data);
        
        const { id } = req.body.data;
        
        // Encuentra el producto
        const existProd = await producto.findOne({ where: { ProductoID: Number(id) } });
        
        // Si el producto no existe, retorna un error 404
        if (!existProd) {
            return res.status(404).json({ msg: "Producto no encontrado" });
        }
        
        console.log("Producto encontrado, actualizando...");
        
        // Actualiza el estado del producto a false (eliminado)
        await existProd.update({ Estado: false });
        await createBitacora({UsuarioID:req.user.id,message:`elimino el producto con ID ${req.data.id}`},res);
        console.log("Producto actualizado con éxito");
        
        // Responde con éxito
        res.status(200).json({ msg: "Producto eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        // En caso de error, responde con un código de error 500
        res.status(500).json({ msg: "Ocurrió un error al intentar eliminar el producto" });
    }
};

// Función para actualizar un producto con sus volúmenes asociados
export const updateProducto1 = async (req, res) => {
    console.log("ingresando : "+req.body.data);
    const { ProductoID, Nombre, Precio, Marca, Estante, Categoria, Volumen } = req.body.data;
    const UsuarioID = req.user.id; // Obtener el ID del usuario logueado
    try {
        // Validar que el ID del producto esté presente
        if (!ProductoID) {
            return res.status(400).json({ message: 'El ID del producto es obligatorio.' });
        }
        // Buscar el producto existente
        const productoExistente = await producto.findByPk(ProductoID);
        if (!productoExistente) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        const marca = Marca
            ? await Marca.findOne({ where: { Nombre: Marca } })
            : null;
           
        const estante = Estante
            ? await Estante.findOne({ where: { Nombre: Estante } })
            : null;
           
        const categoria = Categoria
            ? await Categoria.findOne({ where: { Descripcion: Categoria } })
            : null;
        console.log(Marca+"nro "+{marca}),
        console.log(Categoria+"nro "+{categoria}),
        console.log(Estante+"nro "+{estante});
        // Verificar que los registros existan
        if (Marca && !marca) {
            return res.status(404).json({ message: `Marca "${Marca}" no encontrada.` });
        }
        if (Estante && !estante) {
            return res.status(404).json({ message: `Estante "${Estante}" no encontrado.` });
        }
        if (Categoria && !categoria) {
            return res.status(404).json({ message: `Categoría "${Categoria}" no encontrada.` });
        }

        // Actualizar el producto con los nuevos valores (si se proporcionan)
        const updatedProducto = await producto.update(
            {
                Nombre: Nombre || productoExistente.Nombre,
                Precio: Precio !== undefined ? parseFloat(Precio) : productoExistente.Precio,
                MarcaID: Marca !== undefined ? parseInt(Marca) : productoExistente.MarcaID,
                EstanteID: Estante !== undefined ? parseInt(Estante) : productoExistente.EstanteID,
                CategoriaID: Categoria !== undefined ? parseInt(Categoria) : productoExistente.CategoriaID,
                Estado: 1 // Se mantiene el estado activo
            },
            {
                where: { ProductoID } // Filtrar por el ID del producto
            }
        );
        // Actualizar o crear la asociación con el volumen en la tabla intermedia CantidadVolumen
        if (Volumen !== undefined) {
            const cantidadVolumenExistente = await CantidadVolumen.findOne({
                where: { ProductoID }
            });

            if (cantidadVolumenExistente) {
                // Actualizar la asociación existente
                await CantidadVolumen.update(
                    { VolumenID: parseInt(Volumen) },
                    { where: { ProductoID } }
                );
            } else {
                // Crear una nueva asociación si no existe
                await CantidadVolumen.create({
                    ProductoID,
                    VolumenID: parseInt(Volumen)
                });
            }
        }
        // Registrar el evento en la bitácora
        const message = `actualizado prod: ${ProductoID}, Name ${Nombre || productoExistente.Nombre}`;
        await createBitacora({ UsuarioID, message });
        res.status(200).json({
            message: 'Producto actualizado exitosamente.',
            producto: updatedProducto
        });
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ message: 'Error al actualizar el producto.' });
    }
};


