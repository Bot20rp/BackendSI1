//importar la dep. para crear imagenes
import multer from 'multer';
import path from 'path'
import { fileURLToPath } from 'url';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import {v2 as cloudinary} from 'cloudinary'

//configuracion para guardar imagen
// const guardar=multer.diskStorage({
//     destination:path.join(__dirname,'../libs/image'),
//     filename:(req,file,cb)=>{
//         cb(null,Date.now()+'-'+file.originalname)
//     }
// })

// const filtro=(req,file,cb)=>{
//     if(file && (file.mimetype ==='image/jpg' || file.mimetype=='image/jpeg'  ||file.mimetype ==='image/png')){
//         cb(null,true)
//     }else{
//         cb(null,false)
//     }
// }

// export const fileUpload=multer({
//     storage:guardar,
//     fileFilter:filtro
// }).single('imagen')

cloudinary.config({
    cloud_name:'da6k5ykfs',
    api_key: '367696499464279',
    api_secret: '8LFPq-JEgY2KIavvc9e6Bw518yE',
})

const guardarImage= new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'bunker', // Carpeta donde se guardarán las imágenes
        allowed_formats: ['jpg', 'jpeg', 'png'], // Tipos de archivos permitidos
        public_id: (req, file) => `imagen_${Date.now()}`, // Nombre único para cada imagen
    },
})

export const fileUpload=multer({
    storage:guardarImage
}).single('imagen')
