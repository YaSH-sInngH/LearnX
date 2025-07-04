import React, { useState, useEffect, useRef } from 'react';
import { getTrackDiscussions, getModuleDiscussions, createDiscussion, editDiscussion, deleteDiscussion, uploadAttachment } from '../api/tracks';
import { useAuth } from '../auth/AuthProvider';

export default function DiscussionPanel({ trackId, moduleId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [trackId, moduleId]);

  const fetchMessages = async () => {
    const data = trackId
      ? await getTrackDiscussions(trackId)
      : await getModuleDiscussions(moduleId);
    setMessages(data);
    // Scroll to bottom after loading
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };


  const handleSend = async () => {
    if (!newMsg.trim() && !attachment) return;
  
    try {
      setUploading(true);
      
      let attachmentUrl = '';
      if (attachment) {
        try {
          const { url } = await uploadAttachment(attachment);
          attachmentUrl = url;
        } catch (uploadError) {
          console.error('Upload failed:', uploadError);
          toast.error('Attachment upload failed: ' + uploadError.message);
          return;
        }
      }
  
      await createDiscussion({
        trackId,
        moduleId,
        content: newMsg,
        parentId: replyTo,
        attachments: attachmentUrl ? [attachmentUrl] : []
      });
  
      setNewMsg('');
      setReplyTo(null);
      setAttachment(null);
      fetchMessages();
    } catch (error) {
      console.error('Message send error:', error);
      toast.error('Failed to send message: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (id) => {
    await editDiscussion(id, editContent);
    setEditingId(null);
    setEditContent('');
    fetchMessages();
  };

  const handleDelete = async (id) => {
    await deleteDiscussion(id);
    fetchMessages();
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large (max 10MB)');
      return;
    }
    
    // Optional: Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, or PDF files are allowed');
      return;
    }
    
    setAttachment(file);
  };

  // Helper to build nested threads
  const buildTree = (msgs, parentId = null) =>
    msgs.filter(m => m.parentId === parentId).map(m => ({
      ...m,
      replies: buildTree(msgs, m.id)
    }));

  const renderMessages = (msgs, level = 0) => msgs.map(msg => (
    <div key={msg.id} style={{ marginLeft: level * 24 }} className="mb-3 pb-2 border-b last:border-b-0 last:mb-0 last:pb-0 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-1 ">
        <img src={msg.user?.avatarUrl || '/default-avatar.png'} alt={msg.user?.name} className="w-6 h-6 rounded-full" />
        <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">{msg.user?.name || 'User'}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
      </div>
      {editingId === msg.id ? (
        <div>
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className="w-full border rounded p-2"
            rows={2}
          />
          <button onClick={() => handleEdit(msg.id)} className="text-blue-600 mr-2">Save</button>
          <button onClick={() => setEditingId(null)} className="text-gray-600 dark:text-gray-300">Cancel</button>
        </div>
      ) : (
        <div className="ml-8 text-gray-800 dark:text-gray-200 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-2 flex flex-col">
         
          <span>{msg.content}</span>
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="mt-2 flex flex-col gap-1">
              {msg.attachments.map((url, i) => {
                const isImage = url.match(/\.(jpeg|jpg|png|gif)$/i);
                return (
                  <div key={i}>
                    {isImage ? (
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={`attachment-${i+1}`} className="max-h-32 rounded border mb-1" />
                      </a>
                    ) : (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 underline block">
                        {`Attachment ${i+1}`}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex space-x-2 text-xs mt-1">
            {user?.id === msg.userId && (
              <>
                <button onClick={() => { setEditingId(msg.id); setEditContent(msg.content); }} className="text-yellow-600">Edit</button>
                <button onClick={() => handleDelete(msg.id)} className="text-red-600 dark:text-red-400">Delete</button>
              </>
            )}
            <button onClick={() => setReplyTo(msg.id)} className="text-blue-600 dark:text-blue-400">Reply</button>
          </div>
          {replyTo === msg.id && (
            <div className="mt-2">
              <textarea
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder="Write a reply..."
                className="w-full border rounded p-2"
                rows={2}
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 dark:bg-blue-400 text-white px-4 py-1 rounded"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Send'}
              </button>
              <button onClick={() => { setReplyTo(null); setNewMsg(''); }} className="ml-2 text-gray-600 dark:text-gray-300">Cancel</button>
            </div>
          )}
        </div>
      )}
      {/* Render replies */}
      {msg.replies && renderMessages(msg.replies, level + 1)}
    </div>
  ));

  const tree = buildTree(messages);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 sm:p-4">
      <h3 className="font-semibold mb-2 text-sm sm:text-base">Discussion</h3>
      <div className="border rounded bg-gray-50 dark:bg-gray-900 p-2 max-h-48 sm:max-h-64 overflow-y-auto mb-4 dark:border-gray-700">
        {messages.length === 0 && <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">No messages yet. Start the discussion!</div>}
        {renderMessages(tree)}
        <div ref={messagesEndRef} />
      </div>
      {/* Main input for new message (not a reply) */}
      {!replyTo && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end space-y-2 sm:space-y-0 sm:space-x-2">
          <textarea
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            placeholder="Add a message..."
            className="w-full border rounded p-2 dark:bg-gray-900 text-sm sm:text-base"
            rows={2}
          />
          <div className="flex items-center space-x-2 sm:space-x-0 sm:flex-col sm:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
            <label className="flex items-center cursor-pointer gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900 transition flex-1 sm:flex-none justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l7.072-7.072a4 4 0 10-5.656-5.656l-8.486 8.486a6 6 0 108.486 8.486l1.414-1.414" />
              </svg>
              <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 truncate max-w-20 sm:max-w-none">{attachment ? attachment.name : "Attach file"}</span>
              <input
                type="file"
                onChange={handleAttachmentChange}
                className="hidden"
                id="discussion-attachment"
              />
            </label>
            <button
              onClick={handleSend}
              className="bg-blue-600 dark:bg-blue-400 text-white px-3 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm flex-1 sm:flex-none whitespace-nowrap"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
