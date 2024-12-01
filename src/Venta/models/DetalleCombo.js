import { DataTypes } from "sequelize";
import { db } from "../../config/dbConfig.js";
import Combo from "./Combo.js"; // Asegúrate de importar el modelo Combo
import Producto from "../../AdministrarInventario/models/Producto.js"; // Asegúrate de importar el modelo Producto

const DetalleCombo = db.define('DetalleCombo', {
    ComboID: {
        type: DataTypes.STRING(4),
        references: {
            model: Combo, // Referencia al modelo Combo
            key: 'ComboID'
        },
        primaryKey: true,
        allowNull: false
    },
    ProductoID: {
        type: DataTypes.INTEGER,
        references: {
            model: Producto, // Referencia al modelo Producto
            key: 'ProductoID'
        },
        primaryKey: true,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1 // Valor predeterminado en caso de no especificar cantidad
    }
}, {
    tableName: 'DetalleCombo',
    timestamps: false
});


export default DetalleCombo;
