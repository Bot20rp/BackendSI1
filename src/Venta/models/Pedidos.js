import { DataTypes } from "sequelize";
import { db } from "../../config/dbConfig.js";
import MetodoEntrega from "./MetodoEntrega.js";
import NotaVenta from "./NotaVenta.js";
//pedidodd
const Pedidos = db.define('Pedidos', {
    PedidoID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Estado: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    M_entregaID: {
        type: DataTypes.INTEGER,
        references: {
            model: MetodoEntrega,
            key: 'M_entregaID'
        }
    },
    NotaVentaID: {
        type: DataTypes.INTEGER,
        references: {
            model: NotaVenta,
            key: 'NotaVentaID'
        }
    }
}, {
    tableName: 'Pedidos',
    timestamps: false
});

// Relaciones
MetodoEntrega.hasMany(Pedidos, { foreignKey: 'M_entregaID' });
Pedidos.belongsTo(MetodoEntrega, { foreignKey: 'M_entregaID' });

NotaVenta.hasMany(Pedidos, { foreignKey: 'NotaVentaID' });
Pedidos.belongsTo(NotaVenta, { foreignKey: 'NotaVentaID' });

export default Pedidos;
