import { db } from "../../config/dbConfig.js";
import { DataTypes } from "sequelize";
const Empleado =db.define('empleado',{
    EmpleadoID:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        references:{
            model: 'Usuario',
            key: 'UsuarioID'
        }
    },
    Salario:{
        type:DataTypes.FLOAT,
        allowNull:false
    },
    HorarioInicio:{
        type:DataTypes.TIME,
        allowNull:false
    },
    HorarioFin:{
        type:DataTypes.TIME,
        allowNull:false
    }
},{
    tableName:'Empleado',
    timestamps:false
})

// cliente.belongsTo(Usuario, { foreignKey: 'ClienteID' });

export async function getEmple(id){
    const [data,metadata]= await db.query( `Call obtenerEmpleados(${id})`)
    return data
}
export default Empleado;