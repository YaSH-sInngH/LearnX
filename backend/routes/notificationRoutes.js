import express from 'express';
import {
  markAsRead,
  createNotification,
  getUserNotifications
} from '../controllers/notificationController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getUserNotifications);
router.patch('/:id/read', authenticate, markAsRead);

// Admin-only route
router.post('/:userId', authenticate, authorize(['Admin']), createNotification);

export default router;