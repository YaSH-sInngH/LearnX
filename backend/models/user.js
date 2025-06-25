import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('Admin', 'Creator', 'Learner'),
    defaultValue: 'Learner',
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verificationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  expertise: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  level: {
    type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
    defaultValue: 'Beginner',
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  streakDays: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastActiveDate: {
    type: DataTypes.DATEONLY
  },
  badges: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  timestamps: true,
});

export default User;