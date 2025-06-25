import { Enrollment, Module, Track } from '../models/index.js';

export const saveModuleProgress = async (req, res) => {
  try {
    const { moduleId, position, completed } = req.body;
    
    const module = await Module.findByPk(moduleId, {
      include: [{
        model: Track,
        attributes: ['id']
      }]
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    let enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.id,
        trackId: module.Track.id
      }
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        userId: req.user.id,
        trackId: module.Track.id,
        progressData: {}
      });
    }

    // Update progress data
    const progressData = enrollment.progressData || {};
    progressData[moduleId] = {
      lastPosition: position,
      completed: completed || (progressData[moduleId]?.completed || false),
      updatedAt: new Date()
    };

    // Update completed modules if needed
    let completedModules = [...enrollment.completedModules];
    if (completed && !completedModules.includes(moduleId)) {
      completedModules.push(moduleId);
    }

    // Calculate overall progress
    const totalModules = await Module.count({ where: { trackId: module.Track.id } });
    const progress = Math.round((completedModules.length / totalModules) * 100);

    await enrollment.update({
      progressData,
      completedModules,
      progress,
      lastModuleId: moduleId,
      lastAccessed: new Date()
    });

    res.json({
      progress,
      completedModules,
      moduleProgress: progressData[moduleId]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save progress' });
  }
};

export const getTrackProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      where: {
        userId: req.user.id,
        trackId: req.params.trackId
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Not enrolled in this track' });
    }

    res.json({
      progress: enrollment.progress,
      completedModules: enrollment.completedModules,
      lastModuleId: enrollment.lastModuleId,
      lastPosition: enrollment.progressData[enrollment.lastModuleId]?.lastPosition || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get progress' });
  }
};