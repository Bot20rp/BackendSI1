import { json } from "sequelize";
import Apertura from "../models/Apertura.js";

// Función para convertir el formato de hora a 24 horas
function convertTo24HourFormat(time) {
    let [timeStr, modifier] = time.split(' '); // Separa la hora y el 'a.m.'/'p.m.'
    let [hours, minutes, seconds] = timeStr.split(':'); // Separa la hora, minutos y segundos

    // Convierte a 24 horas
    if (modifier.toLowerCase() === 'p.m.' && hours !== '12') {
        hours = (parseInt(hours) + 12).toString();
    } else if (modifier.toLowerCase() === 'a.m.' && hours === '12') {
        hours = '00'; // Caso especial para las 12 a.m., que es medianoche
    }

    // Devuelve la hora en formato de 24 horas
    return `${hours}:${minutes}:${seconds}`;
}

export const InicoApertura = async (req, res)=>{
    try {
        console.log(req.body)
        const {CajaChica,FechaInicio, HoraInicio}=req.body.data; 
        let horaInicio24 = convertTo24HourFormat(HoraInicio);
        // verifica apertura
        const aperturaActiva= await Apertura.findOne({
            where :{FechaCierre:null}
        });
        if (aperturaActiva){
            return res.status(204).json({message:"ya hay una apertura activa"});
        }

        const nuevaApertura =await Apertura.create({
            FechaInicio, 
            FechaCierre:null,
            SaldoEfectivo:0, 
            SaldoQr:0,
            SaldoTarjeta:0,
            recuentoEfectivo:0, 
            recuentoQr:0,
            recuentoTarjeta:0,
            CajaChica,
            HoraInicio:horaInicio24,
            Estado: true
        }); 

        res.status(201).json({
            message:"Apertura Inicidada ",
            data:{AperturaID:nuevaApertura.AperturaID}
        }); 
    }catch(error){
        console.error("Error al iniciar la apertura:", error); 
        res.status(500).json({message:"Erro al iniciar la apertura."});
    }

}; 


export const CierreApertura = async (req, res)=>{
    try {
        const {AperturaID,FechaCierre,HoraFin,CajaChica,SaldoEfectivo, SaldoQr, SaldoTarjeta,recuentoEfectivo,recuentoQr,recuentoTarjeta}=req.body.data; 
        let horaInicio24 = convertTo24HourFormat(HoraFin);
        // verifica apertura
        const aperturaActiva= await Apertura.findOne({
            where :{AperturaID, FechaCierre:null}
        });
        if (!aperturaActiva){
            return res.status(400).json({message:"No existe dicha apertura"});
        }

       await Apertura.update({
            FechaCierre,
            SaldoEfectivo, 
            SaldoQr,
            SaldoTarjeta,
            recuentoEfectivo, 
            recuentoQr,
            recuentoTarjeta,
            CajaChica,
            HoraFin:horaInicio24,
            Estado: false
        },
        {
            where:{AperturaID}
        }
        ); 

        res.status(200).json({
            message:"Apertura cerrada con exito",
            data:{AperturaID, FechaCierre, HoraFin}
        }); 
    }catch(error){
        console.error("Error al cerrar la apertura:", error); 
        res.status(500).json({message:"Erro al cerrar la apertura."});
    }
}; 

export const ObtenerAperturaActivas = async (req, res)=>{
    try{
        const aperturasActivas= await Apertura.findAll({
            where:{
                FechaCierre:null
            }
        })

        if (aperturasActivas.length==0){
            return res.status(204).json({message:"No hay aperturas activas"}); 
        }

        res.status(200).json({
            message:"Apertura activa obtenida:", 
            data:aperturasActivas
        });

    } catch(error){
        console.error("Error al intentar obtener aperturas:",error); 
        res.status(500).json({message:"Error al intentar obtener aperturas."})
    }

}


