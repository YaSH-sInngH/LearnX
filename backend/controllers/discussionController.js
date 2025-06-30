import { Discussion, User, Track } from '../models/index.js';
import { supabase } from '../services/supabase.js';
import { notifyDiscussionReply } from '../services/notificationService.js';

export const createDiscussion = async (req, res) => {
    try {
        const { trackId, moduleId, content, parentId, attachments } = req.body;
        const userId = req.user.id;
        
        let attachmentUrls = [];
        if (req.files) {
            for (const file of req.files) {
                const fileName = `discussions/${trackId}/${userId}/${Date.now()}-${file.originalname}`;
                const { data, error } = await supabase.storage
                    .from('discussion-attachments')
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype
                    });
                
                if (error) throw error;
                attachmentUrls.push(`${process.env.SUPABASE_URL}/storage/v1/object/public/discussion-attachments/${fileName}`);
            }
        }

        const discussion = await Discussion.create({
            trackId,
            moduleId,
            content,
            parentId: parentId || null,
            attachments: attachmentUrls,
            userId
        });

        // If this is a reply, notify the parent message author
        if (parentId) {
            try {
                const parentDiscussion = await Discussion.findByPk(parentId, {
                    include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
                });
                
                if (parentDiscussion && parentDiscussion.userId !== userId) {
                    const track = await Track.findByPk(trackId);
                    const currentUser = await User.findByPk(userId);
                    
                    await notifyDiscussionReply(
                        parentDiscussion.userId,
                        track.title,
                        currentUser.name
                    );
                }
            } catch (notificationError) {
                console.error('Failed to send discussion notification:', notificationError);
            }
        }

        res.status(201).json(discussion);
    } catch (error) {
        console.error('Discussion creation error:', error);
        res.status(500).json({ error: 'Failed to create discussion' });
    }
};

export const getTrackDiscussions = async (req, res) => {
    const { trackId } = req.params;
    const discussions = await Discussion.findAll({
        where: { trackId },
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] }],
        order: [['createdAt', 'ASC']]
    });
    res.json(discussions);
};

export const getModuleDiscussions = async (req, res) => {
    const { moduleId } = req.params;
    const discussions = await Discussion.findAll({
        where: { moduleId },
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] }],
        order: [['createdAt', 'ASC']]
    });
    res.json(discussions);
};

export const updateDiscussion = async (req, res) => {
    try {
        const discussion = await Discussion.findByPk(req.params.discussionId);
        
        if (!discussion) {
            return res.status(404).json({ error: 'Discussion not found' });
        }
        
        if (discussion.userId !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await discussion.update({ content: req.body.content });
        res.json(discussion);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update discussion' });
    }
};

export const deleteDiscussion = async (req, res) => {
    const { id } = req.params;
    const discussion = await Discussion.findByPk(id);
    if (!discussion) return res.status(404).json({ error: 'Not found' });
    if (String(discussion.userId) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    await discussion.destroy();
    res.json({ success: true });
};

export const uploadAttachment = async (req, res) => {
    // handle file upload and return URL
};

export const editDiscussion = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        const discussion = await Discussion.findByPk(id);
        if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
        if (discussion.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
        discussion.content = content;
        discussion.updatedAt = new Date();
        await discussion.save();
        res.json(discussion);
    } catch (err) {
        res.status(500).json({ error: 'Failed to edit discussion' });
    }
};

export const getDiscussionById = async (req, res) => {
    // handle discussion retrieval
};

