import express from 'express';
import { 
  addModule,
  getModuleWithQuiz,
  uploadModuleVideo,
  getVideoStatus,
} from '../controllers/moduleController.js';
import { submitQuiz, getQuizAttempts } from '../controllers/quizController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import multer from 'multer';

const videoUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 500 * 1024 * 1024 // 500MB
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed'), false);
      }
    }
  });

const router = express.Router();

router.post('/:trackId/modules', authenticate, authorize('Creator'), addModule);
router.get('/:moduleId', authenticate, getModuleWithQuiz);
router.post(
    '/:moduleId/video', 
    authenticate, 
    authorize('Creator'), 
    videoUpload.single('video'), 
    uploadModuleVideo
  );
  
  router.get(
    '/:moduleId/video-status', 
    authenticate, 
    getVideoStatus
  );

  router.post('/:moduleId/quiz', authenticate, submitQuiz);
  router.get('/:moduleId/quiz/attempts', authenticate, getQuizAttempts);
export default router;