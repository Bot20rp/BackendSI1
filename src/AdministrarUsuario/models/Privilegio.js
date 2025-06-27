import { DataTypes } from 'sequelize';
import { db } from '../../config/dbConfig.js';

const Privilegio = db.define('Privilegio', {
  PrivilegioID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  Descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'Privilegio',
  timestamps: false
});

export default Privilegio;