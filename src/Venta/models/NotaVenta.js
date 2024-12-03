
import { DataTypes } from 'sequelize';
import { db } from '../../config/dbConfig.js';
import Cliente from '../../AdministrarUsuario/models/Cliente.js';  // Ajustar el nombre y ubicación según tu proyecto
import Factura from './Factura.js';  // Ajustar el nombre y ubicación según tu proyecto
import TipoVenta from './TipoVenta.js';  // Ajustar el nombre y ubicación según tu proyecto
// nota venta
const NotaVenta = db.define('NotaVenta', {
    NotaVentaID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Descripcion: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    ClienteID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cliente,
            key: 'ClienteID',
        },
    },
    FacturaID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Factura,
            key: 'FacturaID',
        },
    },
    TipoVID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TipoVenta,
            key: 'TipoVID',
        },
    },
    Total: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    tableName: 'NotaVenta',
    timestamps: false,
});


export default NotaVenta;
