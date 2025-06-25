import express from 'express';
import { 
  createDiscussion,
  getTrackDiscussions,
  updateDiscussion,
  deleteDiscussion
} from '../controllers/discussionController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for attachments
  }
});

// Create new discussion (with optional attachment)
router.post('/tracks/:trackId', 
  authenticate, 
  upload.single('attachment'), 
  createDiscussion
);

// Get all discussions for a track
router.get('/tracks/:trackId', authenticate, getTrackDiscussions);

// Update discussion (author only)
router.put('/:discussionId', authenticate, updateDiscussion);

// Delete discussion (author or admin)
router.delete('/:discussionId', 
  authenticate, 
  deleteDiscussion
);

export default router;