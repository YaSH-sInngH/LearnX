import { Module, Quiz, Track } from '../models/index.js';
import { generateQuiz } from '../services/aiService.js'; // Implement AI integration
import { processModuleVideo, checkVideoProcessingStatus } from '../services/videoProcessingService.js';
import { supabase } from '../services/supabase.js';


export const addModule = async (req, res) => {
  try {
    const track = await Track.findByPk(req.params.trackId);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    if (track.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const module = await Module.create({
      ...req.body,
      trackId: req.params.trackId
    });

    // Auto-generate quiz if video URL provided
    if (req.body.videoUrl) {
      const quiz = await generateQuiz(req.body.videoUrl); // AI service
      await Quiz.create({
        ...quiz,
        moduleId: module.id
      });
    }

    res.status(201).json(module);
  } catch (error) {
    console.error('Error adding module:', error);
    res.status(500).json({ error: 'Failed to add module' });
  }
};

// Add to existing controller
export const uploadModuleVideo = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.moduleId, {
      include: [{
        model: Track,
        as: 'Track',
        attributes: ['creatorId']
      }]
    });
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    if (!module.Track) {
      return res.status(404).json({ error: 'Track not found for this module' });
    }
    if (module.Track.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const fileName = `module-${req.params.moduleId}-${Date.now()}.mp4`;
    const { data, error } = await supabase.storage
      .from('module-videos')
      .upload(fileName, req.file.buffer, {
        contentType: 'video/mp4',
        cacheControl: '3600',
        upsert: false
      });
    if (error) throw error;

    const { videoUrl, processingJobId } = await processModuleVideo(
      req.file.buffer,
      req.user.id,
      req.params.moduleId
    );

    await module.update({
      videoUrl,
      videoStatus: 'processing',
      videoProcessingJobId: processingJobId
    });

    res.json({
      message: 'Video upload started',
      statusUrl: `/modules/${req.params.moduleId}/video-status`
    });
  } catch (error) {
    res.status(500).json({ error: 'Video upload failed' });
  }
};

export const getVideoStatus = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.moduleId);
    if (!module) return res.status(404).json({ error: 'Module not found' });

    if (module.videoStatus === 'ready') {
      return res.json({ status: 'ready', videoUrl: module.videoUrl });
    }

    const status = await checkVideoProcessingStatus(module.videoProcessingJobId);
    if (status.status === 'ready') {
      await module.update({
        videoStatus: 'ready',
        videoDuration: status.duration
      });
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check status' });
  }
};

export const getModuleWithQuiz = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.moduleId, {
      include: [{
        model: Quiz,
        as: 'quiz'
      }]
    });
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    res.json(module);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch module' });
  }
};