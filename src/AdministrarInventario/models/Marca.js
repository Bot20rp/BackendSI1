import { db } from "../../config/dbConfig.js";
import { DataTypes } from "sequelize";

const marca = db.define(
  "Marca",
  {
    MarcaID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Nombre: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    Region: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    Descripcion: { // Nueva columna
      type: DataTypes.STRING(100), // Tamaño de 100 caracteres
      allowNull: true, // Permitir valores nulos si no es obligatorio
      defaultValue: "marcas nuevas", // Valor por defecto
    },
  },
  {
    tableName: "Marca",
    timestamps: false,
  }
);

export default marca;

  