import express from 'express';
import { 
  createTrack,
  uploadTrackCover,
  getTrackAnalytics,
  enrollInTrack,
  searchTracks
} from '../controllers/trackController.js';
import { saveModuleProgress, getTrackProgress } from '../controllers/progressController.js';
import { createReview, getTrackReviews } from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Track CRUD
router.post('/', authenticate, authorize('Creator'), createTrack);
router.post('/:trackId/cover', authenticate, upload.single('cover'), uploadTrackCover);

// Enrollment
router.post('/:trackId/enroll', authenticate, enrollInTrack);

// Analytics
router.get('/:trackId/analytics', authenticate, authorize(['Creator']), getTrackAnalytics);

router.post('/:trackId/reviews', authenticate, createReview);
router.get('/:trackId/reviews', getTrackReviews);
router.get('/search', searchTracks);

router.post('/:trackId/progress', authenticate, saveModuleProgress);
router.get('/:trackId/progress', authenticate, getTrackProgress);
export default router;