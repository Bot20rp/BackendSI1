import Factura from "../models/Factura.js";
import NotaVenta from "../models/NotaVenta.js";
import Cliente from "../../AdministrarUsuario/models/Cliente.js";
import Producto from "../../AdministrarInventario/models/Producto.js";
import DetalleVenta from "../models/DetalleVenta.js";
import Transaccion from "../models/Transaccion.js";
import TipoVenta from '../models/TipoVenta.js';
import Apertura from "../models/Apertura.js";
import Combo from "../models/Combo.js";
import { DataTypes } from 'sequelize';
import { db } from '../../config/dbConfig.js';
import Suministro from "../../AdministrarInventario/models/Suministro.js";
import DetalleCombo from "../models/DetalleCombo.js";
import VentaCombo from "../models/VentaCombo.js";


export const getTipoVenta= async (req, res)=>{
    try{
        const tiposVentas = await TipoVenta.findAll({
            attributes:['TipoVID','Nombre'],
        }); 

        res.status(200).json({
            message:'tipos de ventas obtenidos',
            tiposVentas,
        });
    }catch(error){
        console.error('error al obtener los tipos de ventas',error); 
        res.status(500).json({message:'Error al obtener los tipos de ventas',error:error.message});
    }
}


export const crearFactura = async (req, res) => {
  console.log(req.body.data)
  try {
    const { clienteID, productos,combos, fecha, tipoVenta, totalVenta, pagoEfectivo, pagoQr, pagoTarjeta } = req.body.data;

    // Obtener el último número de factura
    const ultimaFactura = await Factura.findOne({ order: [['NroFactura', 'DESC']] });
    const nuevoNroFactura = ultimaFactura ? ultimaFactura.NroFactura + 1 : 1;

    // Validar existencia del cliente
    const cliente = await Cliente.findByPk(clienteID);
    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });

    // Generar el Código de Control y Código de Autorización usando los procedimientos almacenados
   await db.query('CALL GenerarCodigoControl(@CodigoControl)');
   const [codigoControlResult] = await db.query('SELECT @CodigoControl AS CodigoControl');
   console.log(codigoControlResult);

   await db.query('CALL GenerarCodigoDeAutorizacion(@CodigoDeAutorizacion)');
   const [codigoAutorizacionResult] = await db.query('SELECT @CodigoDeAutorizacion AS CodigoDeAutorizacion');
   console.log(codigoAutorizacionResult);
    
    const CodigoControl = codigoControlResult[0].CodigoControl; 
    const CodigoDeAutorizacion = codigoAutorizacionResult[0].CodigoDeAutorizacion;

    // Obtener Apertura activa
    const aperturasActivas = await Apertura.findAll({
        where: {
          FechaCierre: null,
        },
      });
  
      if (aperturasActivas.length === 0) {
        return res.status(404).json({ message: "No hay aperturas activas" });
      }
  
      // Seleccionamos la primera apertura activa
      const aperturaID = aperturasActivas[0].AperturaID;

    // Crear la factura
    const nuevaFactura = await Factura.create({
      NroFactura: nuevoNroFactura,
      Fecha: fecha,
      NIT: 534553,
      Detalle: "Venta de productos",
      CodigoControl,
      CodigoDeAutorizacion,
      TotalInteres: totalVenta,
      Estado: true,
    });

    // Crear la nota de venta asociada a la factura
    const nuevaNotaVenta = await NotaVenta.create({
      FacturaID: nuevaFactura.FacturaID,
      ClienteID: clienteID,
      TipoVID: tipoVenta,
      Total: totalVenta,
    });

    // Procesar cada producto en el array de productos
    for (const producto of productos) {
        const productoID = producto.id;
      const {  cantidad } = producto;

      // Validar existencia del producto
      const productoExistente = await Producto.findByPk(productoID);
      if (!productoExistente) continue;

      // Crear detalle de venta para cada producto
      await DetalleVenta.create({
        ProductoID: productoID,
        NotaVentaID: nuevaNotaVenta.NotaVentaID,
        cantidad: cantidad,
      });
      const suministro = await Suministro.findOne({ where: { ProductoID: productoID } });
      if (suministro) {
        const nuevaCantidadSaldo = suministro.CantidadSaldo - cantidad;
        if (nuevaCantidadSaldo < 0) {
          return res.status(400).json({ message: `No hay suficiente suministro para el producto con ID ${productoID}` });
        }
        console.log(`Actualizando suministro para ProductoID ${productoID} a CantidadSaldo: ${nuevaCantidadSaldo}`);
        // Actualizar el saldo en Suministro
        await suministro.update({ CantidadSaldo: nuevaCantidadSaldo });
      }else {
        console.warn(`Suministro no encontrado para ProductoID ${productoID}`);
      }
    }
    // Procesar los combos
    if (combos && combos.length > 0) {
      for (const combo of combos) {
        const comboID = combo.id;
        const { cantidad } = combo;

        // Validar existencia del combo
        const comboExistente = await Combo.findByPk(comboID);
        if (!comboExistente) continue;

        // Crear registro en VentaCombo
        await VentaCombo.create({
          ComboID: comboID,
          NotaVentaID: nuevaNotaVenta.NotaVentaID,
        });
        // Obtener los productos del combo y actualizar sus cantidades en Suministro
        const detallesCombo = await DetalleCombo.findAll({ where: { ComboID: comboID } });
        for (const detalle of detallesCombo) {
          const productoID = detalle.ProductoID;
          const cantidadProducto = detalle.cantidad * cantidad;

          const suministro = await Suministro.findOne({ where: { ProductoID: productoID } });
          if (suministro) {
            const nuevaCantidadSaldo = suministro.CantidadSaldo - cantidadProducto;
            if (nuevaCantidadSaldo < 0) {
              return res.status(400).json({
                message: `No hay suficiente suministro para el producto con ID ${productoID} en el combo ${comboID}`,
              });
            }
            await suministro.update({ CantidadSaldo: nuevaCantidadSaldo });
          }
        }
      }
    }

    // Registrar transacciones para los diferentes tipos de pago
    const transacciones = [];
    if (pagoEfectivo > 0) {
      transacciones.push({
        TipoPagoID: 1, // ID de Efectivo
        NotaVentaID: nuevaNotaVenta.NotaVentaID,
        Monto: pagoEfectivo,
        AperturaID: aperturaID, // O el ID actual de la apertura
      });
    }
    if (pagoQr > 0) {
      transacciones.push({
        TipoPagoID: 2, // ID de QR
        NotaVentaID: nuevaNotaVenta.NotaVentaID,
        Monto: pagoQr,
        AperturaID: aperturaID,
      });
    }
    if (pagoTarjeta > 0) {
      transacciones.push({
        TipoPagoID: 3, // ID de Tarjeta
        NotaVentaID: nuevaNotaVenta.NotaVentaID,
        Monto: pagoTarjeta,
        AperturaID: aperturaID,
      });
    }

    await Transaccion.bulkCreate(transacciones);

    res.status(201).json({
      message: "Factura creada exitosamente",
      facturaID: nuevaFactura.FacturaID,
    });
  } catch (error) {
    console.error("Error al crear la factura:", error);
    res.status(500).json({ message: "Error al crear la factura" });
  }
};
