import Factura from "../models/Factura.js";
import NotaVenta from "../models/NotaVenta.js";
import DetalleVenta from "../models/DetalleVenta.js";
import Producto from "../../AdministrarInventario/models/Producto.js";
import Usuario from "../../AdministrarUsuario/models/Usuario.js";  
import Cliente from "../../AdministrarUsuario/models/Cliente.js";
import DetalleDocumento from "../../AdministrarUsuario/models/DetalleDocumento.js";

import PDFDocument from 'pdfkit';
export const pdfFactura=async (req, res) => {
    console.log(req.query)
    const {id}=req.query
    console.log(id)
  try {

    
    const factura=await Factura.findOne({
        where:{
            NroFactura:parseInt(id)
        },
        include:[
            {
                model:NotaVenta,
                as:'NotaVenta',
                include:[
                    {
                        model:Cliente,
                        include:[
                            {
                                model:Usuario,
                                attributes:['Nombre','UsuarioID'],
                                include:[
                                    {
                                        model:DetalleDocumento,
                                        as:'DetalleDocumentos',
                                        attributes:['NumeroDocumento','DocumentoID']
                                    }
                                ]
                            }
                        ]
                    },{
                       model:DetalleVenta,
                       include:[
                        {
                            model:Producto,
                            attributes:['ProductoID','Nombre','Precio']
                        }
                       ] 
                    }
                ]
            }
        ]
    })
   if(!factura){
    return res.status(404).json({msg:"factura no encontrada"})
   }
const producto=factura.NotaVenta.DetalleVenta.map((obj)=>({
    nombre:obj.producto.Nombre,
    precio:obj.producto.Precio,
    cantidad:obj.cantidad
}))
const docu=factura.NotaVenta.Cliente.Usuario.DetalleDocumentos;
const result={           
    NroFactura:factura.NroFactura,
    FechaEmision:factura.Fecha,
    NIT:factura.NIT,
    Documento: (docu[1])?docu[1].NumeroDocumento:docu[0].NumeroDocumento           ,///puede ser CI o nit elcliente
    Detalle:factura.Detalle,
    CodigoControl:factura.CodigoControl,       
    CodigoCliente:factura.NotaVenta.Cliente.Usuario.UsuarioID,
    cliente:factura.NotaVenta.Cliente.Usuario.Nombre,
    producto,
    Total:factura.NotaVenta.Total
    
}
    // Crea un nuevo documento PDF
    const doc = new PDFDocument({
        size: [300, 600], // Ancho 300, Alto 600; ajusta según lo necesites
        margins: { top: 10, bottom: 10, left: 10, right: 10 } // Márgenes reducidos
      });
    // Configura el encabezado para descargar el PDF en el navegador
    res.setHeader('Content-Disposition', 'attachment; filename=factura.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Encabezado de la factura
    doc
      .fontSize(14)
      .text('FACTURA', { align: 'center' })
      .fontSize(10)
      .text('CON DERECHO A CRÉDITO FISCAL', { align: 'center' })
      .fontSize(10)
      .text('EL BUNKER', { align: 'center' })
      .fontSize(10)
      .text('---------------------------------------------------------------------', { align: 'center' })
      .moveDown();
      
    // Información de la empresa y cliente
    doc.text(`Nombre/Razón: ${result.cliente}`, { align: 'left' });
    doc.text(`NIT/CI: ${result.Documento}`, { align: 'left' });
    doc.text(`Cod. Cliente:   ${result.CodigoCliente} `, { align: 'left' })
    doc.text(`Fecha de Emisión: ${result.FechaEmision}`, { align: 'left' })
    .text('---------------------------------------------------------------------', { align: 'center' })
    .moveDown();

    //Detalle de los productos
    doc.text('DETALLE', { align:'center' });
    producto.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        doc.text(`${item.nombre}   ${item.precio} x ${item.cantidad}`, { align: 'left', continued: true });

        // Agrega el subtotal a la derecha
        doc.text(`= ${subtotal.toFixed(2)} Bs`, { align: 'right' });
      });
      doc.moveDown();
 
    doc.text(`SUBTOTAL (Bs)`, { align: 'left', continued: true });
    doc.text(`${result.Total} Bs`,{ align: 'right' });

    doc.text(`TOTAL (Bs)`, { align: 'left', continued: true });
    doc.text(`${result.Total} Bs`,{ align: 'right' });
    doc.text('---------------------------------------------------------------------', { align: 'center' })
    doc.text('Esta factura contribuye al desarrollo del pais el uso ilicito sera sancionao penalmente de acuerdo a Ley', { align: 'center' })
    doc.text('Ley N° 453: El proveedor debera entregar el producti en las modalidades y terminos ofetadodos o convenidos', { align: 'center' })
    // Finaliza el PDF
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar la factura' });
  }
}

export const  getFactura=async (req,res)=>{
    try {
        const factura=await Factura.findAll({
            include:[
                {
                    model:NotaVenta,
                    as:'NotaVenta',
                    include:[
                        {
                            model:Cliente,
                            include:[
                                {
                                    model:Usuario,
                                    attributes:['Nombre','UsuarioID']
                                }
                            ]
                        },{
                           model:DetalleVenta,
                           include:[
                            {
                                model:Producto,
                                attributes:['ProductoID','Nombre','Precio']
                            }
                           ] 
                        }
                    ]
                }
            ]
        })

        const result=factura.map(factura=>{
            const cliente = factura.NotaVenta.Cliente.Usuario.Nombre;
            const CodigoCliente=factura.NotaVenta.Cliente.Usuario.UsuarioID
            const producto=factura.NotaVenta.DetalleVenta.map((obj)=>({
                nombre:obj.producto.Nombre,
                precio:obj.producto.Precio,
                cantidad:obj.cantidad
            }))
            return{
            NroFactura:factura.NroFactura,
            FechaEmision:factura.Fecha,
            NIT:factura.NIT,
            Detalle:factura.Detalle,
            CodigoControl:factura.CodigoControl,       
            CodigoCliente,
            clientesillo:cliente,
            producto,
            Total:factura.NotaVenta.Total
            }
        })
        // console.log(factura);
        res.status(200).json({msg:result});
    } catch (error) {
        console.log(error)
        res.status(500).json({err:error.message})
    }
}


export const  getFacturaByID=async (req,res)=>{
    const {id}=req.body
    try {

        const factura=await Factura.findOne({
            where:{
                FacturaID:parseInt(id)
            },
            include:[
                {
                    model:NotaVenta,
                    as:'NotaVenta',
                    include:[
                        {
                            model:Cliente,
                            include:[
                                {
                                    model:Usuario,
                                    attributes:['Nombre','UsuarioID'],
                                    include:[
                                        {
                                            model:DetalleDocumento,
                                            as:'DetalleDocumentos',
                                            attributes:['NumeroDocumento','DocumentoID']
                                        }
                                    ]
                                }
                            ]
                        },{
                           model:DetalleVenta,
                           include:[
                            {
                                model:Producto,
                                attributes:['ProductoID','Nombre','Precio']
                            }
                           ] 
                        }
                    ]
                }
            ]
        })
       if(!factura){
        return res.status(404).json({msg:"factura no encontrada"})
       }
        const producto=factura.NotaVenta.DetalleVenta.map((obj)=>({
            nombre:obj.producto.Nombre,
            precio:obj.producto.Precio,
            cantidad:obj.cantidad
        }))
        const docu=factura.NotaVenta.Cliente.Usuario.DetalleDocumentos;
        const result={           
            NroFactura:factura.NroFactura,
            FechaEmision:factura.Fecha,
            NIT:factura.NIT,
            Detalle:factura.Detalle,
            Documento:(docu[1])?docu[1].NumeroDocumento:docu[0].NumeroDocumento,
            CodigoControl:factura.CodigoControl,       
            CodigoCliente:factura.NotaVenta.Cliente.Usuario.UsuarioID,
            cliente:factura.NotaVenta.Cliente.Usuario.Nombre,
            producto,
            Total:factura.NotaVenta.Total
            
        }
        // console.log(factura);
        res.status(200).json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json({err:error.message})
    }
}
