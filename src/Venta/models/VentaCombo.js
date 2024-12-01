import { DataTypes } from 'sequelize';
import { db } from '../../config/dbConfig.js';
import Combo from './Combo.js';  // Asegúrate de importar el modelo Combo
import NotaVenta from './NotaVenta.js';  // Asegúrate de importar el modelo NotaVenta

const VentaCombo = db.define('VentaCombo', {
    ComboID: {
        type: DataTypes.STRING(4),
        allowNull: false,
        primaryKey: true,
        references: {
            model: Combo,
            key: 'ComboID'
        }
    },
    NotaVentaID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: NotaVenta,
            key: 'NotaVentaID'
        }
    }
}, {
    tableName: 'VentaCombo',
    timestamps: false
});




export default VentaCombo;
