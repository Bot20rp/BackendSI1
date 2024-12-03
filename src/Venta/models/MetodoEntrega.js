import { DataTypes } from "sequelize";
import { db } from "../../config/dbConfig.js";
//metodo de entrega
const MetodoEntrega = db.define('MetodoEntrega', {
    M_entregaID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nombre: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: 'MetodoEntrega',
    timestamps: false
});

export default MetodoEntrega;
