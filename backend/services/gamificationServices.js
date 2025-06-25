import { User, Achievement, Enrollment, QuizAttempt } from '../models/index.js';

export const updateUserStreak = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const user = await User.findByPk(userId);

  if (!user.lastActiveDate) {
    // First activity
    await user.update({
      streakDays: 1,
      lastActiveDate: today
    });
    return 1;
  }

  const lastActive = new Date(user.lastActiveDate);
  const currentDate = new Date(today);
  const dayDiff = Math.floor((currentDate - lastActive) / (1000 * 60 * 60 * 24));

  let newStreak = user.streakDays;
  if (dayDiff === 1) {
    // Consecutive day
    newStreak += 1;
  } else if (dayDiff > 1) {
    // Broken streak
    newStreak = 1;
  }

  await user.update({
    streakDays: newStreak,
    lastActiveDate: today
  });

  return newStreak;
};

export const awardXP = async (userId, amount, reason) => {
  const user = await User.findByPk(userId);
  const newXP = user.xp + amount;

  await user.update({ xp: newXP });
  
  // Check for level-up
  const newLevel = calculateLevel(newXP);
  if (newLevel > calculateLevel(user.xp)) {
    // Level up logic
  }

  // Check achievements
  await checkAchievements(userId);

  return newXP;
};

const calculateLevel = (xp) => {
  return Math.floor(xp / 1000) + 1; // 1000 XP per level
};

export const checkAchievements = async (userId) => {
  const achievements = await Achievement.findAll();
  const user = await User.findByPk(userId, {
    include: [Enrollment, QuizAttempt]
  });

  for (const achievement of achievements) {
    const hasAchievement = user.Achievements?.some(a => a.id === achievement.id);
    if (hasAchievement) continue;

    if (checkAchievementCriteria(achievement.criteria, user)) {
      await user.addAchievement(achievement);
      await awardXP(userId, achievement.xpReward, `Achievement: ${achievement.name}`);
      
      // Add badge if applicable
      if (achievement.badgeImage) {
        await user.update({
          badges: [...user.badges, achievement.badgeImage]
        });
      }
    }
  }
};

const checkAchievementCriteria = (criteria, user) => {
  // Implement criteria checking logic
  // Example: { type: 'completed_tracks', count: 5 }
  return false; // Simplified for example
};