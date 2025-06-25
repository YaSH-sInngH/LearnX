import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Discussion = sequelize.define('Discussion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    attachmentUrl: {
      type: DataTypes.STRING
    }
  });

  export default Discussion;