import { User, Track, Module, Enrollment, Review } from '../models/index.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['Admin', 'Creator', 'Learner'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ role });
    res.json({ message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
};

export const getPlatformStats = async (req, res) => {
  try {
    const [userCount, trackCount, enrollmentCount, reviewCount] = await Promise.all([
      User.count(),
      Track.count(),
      Enrollment.count(),
      Review.count()
    ]);

    res.json({
      userCount,
      trackCount,
      enrollmentCount,
      reviewCount,
      avgRating: await Review.findOne({
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'average']],
        raw: true
      }).then(r => parseFloat(r.average || 0).toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

export const manageTrack = async (req, res) => {
  try {
    const { action } = req.body;
    const track = await Track.findByPk(req.params.trackId);

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    switch (action) {
      case 'publish':
        await track.update({ isPublished: true });
        break;
      case 'unpublish':
        await track.update({ isPublished: false });
        break;
      case 'feature':
        // Implement featuring logic
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ message: `Track ${action}ed successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to manage track' });
  }
};