import { Track, Module, Enrollment, Discussion, Quiz, User } from '../models/index.js';
import { supabase } from '../services/supabase.js';
import sharp from 'sharp';
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';

export const createTrack = async (req, res) => {
  if (req.user.role !== 'Creator') {
    return res.status(403).json({ error: 'Only creators can create tracks' });
  }

  try {
    const track = await Track.create({
      ...req.body,
      creatorId: req.user.id
    });
    res.status(201).json(track);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create track' });
  }
};

export const uploadTrackCover = async (req, res) => {
  try {
    const optimizedImage = await sharp(req.file.buffer)
      .resize(800, 450)
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `tracks/${req.params.trackId}/cover-${Date.now()}.webp`;
    
    const { data, error } = await supabase.storage
      .from('track-assets')
      .upload(fileName, optimizedImage, {
        contentType: 'image/webp'
      });

    if (error) throw error;

    const coverImageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/track-assets/${fileName}`;
    await Track.update({ coverImageUrl }, { where: { id: req.params.trackId } });
    
    res.json({ coverImageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload cover image' });
  }
};

export const getTrackAnalytics = async (req, res) => {
  try {
    const track = await Track.findByPk(req.params.trackId);
    if (track.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const analytics = await Enrollment.findAll({
      where: { trackId: req.params.trackId },
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }],
      attributes: ['id', 'progress', 'completed', 'createdAt', 'updatedAt']
    });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics' });
  }
};

export const searchTracks = async (req, res) => {
    try {
      const { 
        query = '', 
        category, 
        difficulty, 
        minRating = 0,
        sortBy = 'popular', 
        limit = 10, 
        offset = 0 
      } = req.query;
  
      const where = {
        isPublished: true
      };
  
      if (query) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { tags: { [Op.contains]: [query] } }
        ];
      }
  
      if (category) where.category = category;
      if (difficulty) where.difficulty = difficulty;
      if (minRating) where.rating = { [Op.gte]: minRating };
  
      let order;
      switch (sortBy) {
        case 'newest':
          order = [['createdAt', 'DESC']];
          break;
        case 'highest-rated':
          order = [['rating', 'DESC']];
          break;
        case 'popular':
          order = [
            [sequelize.literal('(SELECT COUNT(*) FROM "Enrollments" WHERE "Enrollments"."trackId" = "Track"."id")'), 'DESC']
          ];
          break;
        default:
          order = [['createdAt', 'DESC']];
      }
  
      const tracks = await Track.findAndCountAll({
        where,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [{
          model: User,
          as: 'Creator',
          attributes: ['id', 'name', 'avatarUrl']
        }]
      });
  
      res.json({
        total: tracks.count,
        results: tracks.rows
      });
    } catch (error) {
      res.status(500).json({ error: 'Search failed' });
    }
  };


  export const enrollInTrack = async (req, res) => {
    try {
      const { trackId } = req.params;
      const userId = req.user.id;
      console.log('Enrolling user:', userId, 'in track:', trackId);
      // Check if already enrolled
      const existing = await Enrollment.findOne({ where: { trackId, userId } });
      if (existing) {
        return res.status(400).json({ error: 'Already enrolled' });
      }
      const enrollment = await Enrollment.create({ trackId, userId });
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to enroll in track' });
    }
  };