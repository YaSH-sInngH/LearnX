import { sequelize } from '../config/database.js';
import User from './User.js';
import Track from './track.js';
import Module from './module.js';
import Quiz from './quiz.js';
import Review from './review.js';
import Enrollment from './enrollment.js';
import Discussion from './discussion.js';
import QuizAttempt from './quizAttempt.js';
import UserAchievement from './userAchievement.js';
import Achievement from './achievements.js';
import Notification from './notification.js';

// Define all relationshi ps
function setupRelationships() {
  // Track <-> User (Creator)
  User.hasMany(Track, { foreignKey: 'creatorId', as: 'createdTracks' });
  Track.belongsTo(User, { foreignKey: 'creatorId', as: 'Creator' });

  // Track <-> Module (One-to-Many)
  Track.hasMany(Module, { foreignKey: 'trackId', as: 'modules', onDelete: 'CASCADE' });
  Module.belongsTo(Track, { foreignKey: 'trackId', as: 'Track' });

  // Module <-> Quiz (One-to-One)
  Module.hasOne(Quiz, { foreignKey: 'moduleId', as: 'quiz', onDelete: 'CASCADE' });
  Quiz.belongsTo(Module, { foreignKey: 'moduleId', as: 'module' });

  // Track <-> Enrollment <-> User (Many-to-Many through Enrollment)
  User.belongsToMany(Track, { through: Enrollment, foreignKey: 'userId', as: 'enrolledTracks' });
  Track.belongsToMany(User, { through: Enrollment, foreignKey: 'trackId', as: 'enrolledUsers' });

  // Track <-> Discussion (One-to-Many)
  Track.hasMany(Discussion, { foreignKey: 'trackId', as: 'discussions', onDelete: 'CASCADE' });
  Discussion.belongsTo(Track, { foreignKey: 'trackId', as: 'track' });

  // User <-> Discussion (One-to-Many)
  User.hasMany(Discussion, { foreignKey: 'userId', as: 'discussionPosts' });
  Discussion.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Discussion Replies (Self-Reference)
  Discussion.hasMany(Discussion, { foreignKey: 'parentId', as: 'replies', onDelete: 'CASCADE' });
  Discussion.belongsTo(Discussion, { foreignKey: 'parentId', as: 'parentDiscussion' });

  // Review <-> User & Track
  Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Review.belongsTo(Track, { foreignKey: 'trackId', as: 'track' });
  User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
  Track.hasMany(Review, { foreignKey: 'trackId', as: 'reviews' });

  // QuizAttempt <-> User, Quiz, Module
  QuizAttempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  QuizAttempt.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });
  QuizAttempt.belongsTo(Module, { foreignKey: 'moduleId', as: 'module' });
  User.hasMany(QuizAttempt, { foreignKey: 'userId', as: 'quizAttempts' });
  Quiz.hasMany(QuizAttempt, { foreignKey: 'quizId', as: 'quizAttempts' });
  Module.hasMany(QuizAttempt, { foreignKey: 'moduleId', as: 'quizAttempts' });

  // User <-> Achievement (Many-to-Many through UserAchievement)
  User.belongsToMany(Achievement, { through: UserAchievement, as: 'achievements' });
  Achievement.belongsToMany(User, { through: UserAchievement, as: 'users' });

  // User <-> Notification (One-to-Many)
  Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
}

// Initialize all models
const models = {
  User,
  Track,
  Module,
  Quiz,
  Enrollment,
  Discussion,
  QuizAttempt,
  UserAchievement,
  Achievement
};

// Export initialized models and sequelize instance
export { 
  sequelize,
  models,
  setupRelationships,
  User,
  Track,
  Module,
  Quiz,
  Enrollment,
  Discussion,
  Review,
  QuizAttempt,
  UserAchievement,
  Achievement,
  Notification
};