import { Notification, User } from '../models/index.js';

export const createNotification = async (userId, {
  type,
  title,
  message,
  metadata = {}
}) => {
  return await Notification.create({
    userId,
    type,
    title,
    message,
    metadata,
    isRead: false
  });
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    where: { id: notificationId, userId }
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return await notification.update({ isRead: true });
};

export const getUserNotifications = async (userId, limit = 20) => {
  return await Notification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit
  });
};