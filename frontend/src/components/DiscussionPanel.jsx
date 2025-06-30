import React, { useState, useEffect, useRef } from 'react';
import { getTrackDiscussions, getModuleDiscussions, createDiscussion, editDiscussion, deleteDiscussion } from '../api/tracks';
import { useAuth } from '../auth/AuthProvider';

export default function DiscussionPanel({ trackId, moduleId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [attachment, setAttachment] = useState(null);
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
    if (!newMsg.trim()) return;
    // TODO: handle attachment upload if needed
    await createDiscussion({
      trackId,
      moduleId,
      content: newMsg,
      parentId: replyTo,
      // attachments: [uploadedUrl] // if you implement file upload
    });
    setNewMsg('');
    setReplyTo(null);
    setAttachment(null);
    fetchMessages();
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
          {msg.attachments && msg.attachments.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 underline block">Attachment {i+1}</a>
          ))}
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
              <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-1 rounded mt-2">Send</button>
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="font-semibold mb-2">Discussion</h3>
      <div className="border rounded bg-gray-50 p-2 max-h-64 overflow-y-auto mb-4 dark:border-gray-700">
        {messages.length === 0 && <div className="text-gray-500 dark:text-gray-400 text-sm">No messages yet. Start the discussion!</div>}
        {renderMessages(tree)}
        <div ref={messagesEndRef} />
      </div>
      {/* Main input for new message (not a reply) */}
      {!replyTo && (
        <div className="flex items-end space-x-2">
          <textarea
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            placeholder="Add a message..."
            className="w-full border rounded p-2 dark:bg-gray-900"
            rows={2}
          />
          {/* Attachment input (optional) */}
          {/* <input type=\"file\" onChange={handleAttachmentChange} /> */}
          <button onClick={handleSend} className="bg-blue-600 dark:bg-blue-400 text-white px-4 py-1 rounded">Send</button>
        </div>
      )}
    </div>
  );
}
