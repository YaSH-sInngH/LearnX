import { Discussion } from '../models/index.js';
import { supabase } from '../services/supabase.js';

export const createDiscussion = async (req, res) => {
    try {
        const { trackId } = req.params;
        const { content, parentId } = req.body;
        const userId = req.user.id;
        
        let attachmentUrl = null;
        if (req.file) {
            const fileName = `discussions/${trackId}/${userId}/${Date.now()}-${req.file.originalname}`;
            const { data, error } = await supabase.storage
                .from('discussion-attachments')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype
                });
            
            if (error) throw error;
            attachmentUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/discussion-attachments/${fileName}`;
        }

        const discussion = await Discussion.create({
            content,
            attachmentUrl,
            trackId,
            userId,
            parentId: parentId || null
        });

        res.status(201).json(discussion);
    } catch (error) {
        console.error('Discussion creation error:', error);
        res.status(500).json({ error: 'Failed to create discussion' });
    }
};

export const getTrackDiscussions = async (req, res) => {
    try {
        const discussions = await Discussion.findAll({
            where: { trackId: req.params.trackId },
            include: [
                {
                    association: 'user',
                    attributes: ['id', 'name', 'avatarUrl']
                },
                {
                    association: 'replies',
                    include: [{
                        association: 'user',
                        attributes: ['id', 'name', 'avatarUrl']
                    }]
                }
            ],
            order: [
                ['createdAt', 'DESC'],
                [{ association: 'replies' }, 'createdAt', 'ASC']
            ]
        });

        res.json(discussions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch discussions' });
    }
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
    try {
        const discussion = await Discussion.findByPk(req.params.discussionId);
        
        if (!discussion) {
            return res.status(404).json({ error: 'Discussion not found' });
        }
        
        if (discussion.userId !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Delete attachment if exists
        if (discussion.attachmentUrl) {
            const filePath = discussion.attachmentUrl.split('/public/')[1];
            await supabase.storage
                .from('discussion-attachments')
                .remove([filePath]);
        }

        await discussion.destroy();
        res.json({ message: 'Discussion deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete discussion' });
    }
};