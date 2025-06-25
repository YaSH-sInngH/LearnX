import { User, Achievement } from '../models/index.js';
import { awardXP } from '../services/gamificationServices.js';

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.findAll({
      attributes: ['id', 'name', 'avatarUrl', 'xp', 'streakDays'],
      order: [['xp', 'DESC']],
      limit: 100
    });

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

export const getUserProgress = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'xp', 'streakDays', 'badges'],
      include: [{
        model: Achievement,
        through: { attributes: ['earnedAt'] },
        attributes: ['id', 'name', 'description', 'badgeImage']
      }]
    });

    const level = calculateLevel(user.xp);
    const levelProgress = user.xp % 1000;

    res.json({
      ...user.toJSON(),
      level,
      levelProgress,
      nextLevelXP: level * 1000
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get progress' });
  }
};

const calculateLevel = (xp) => {
  return Math.floor(xp / 1000) + 1;
};