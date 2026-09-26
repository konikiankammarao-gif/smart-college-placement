import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { IconSend, IconPlus, IconUser, IconSearch, IconMessageSquare } from '../components/Icons';
import api from '../services/api';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // New Chat Modal
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [userList, setUserList] = useState([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [initialMessageText, setInitialMessageText] = useState('');
  const [startingChat, setStartingChat] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations');
      if (res.success && res.data) {
        setConversations(res.data);
        if (!activeConversation && res.data.length > 0) {
          setActiveConversation(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    if (!convId) return;
    try {
      const res = await api.get(`/conversations/${convId}/messages`);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchUsersForNewChat = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.success && res.data) {
        // Exclude current user
        setUserList(res.data.filter((u) => u._id !== user._id));
      }
    } catch (err) {
      // If student/company lacks admin/users permission, fetch from students/companies
      console.log('Falling back for user list');
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchUsersForNewChat();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
      const interval = setInterval(() => {
        fetchMessages(activeConversation._id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      setSending(true);
      const otherParticipant = activeConversation.participants.find(
        (p) => p._id !== user._id
      );

      const res = await api.post('/messages', {
        conversationId: activeConversation._id,
        receiverId: otherParticipant?._id,
        message: newMessage.trim(),
      });

      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        setNewMessage('');
        // Update conversation last message snippet
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConversation._id
              ? {
                  ...c,
                  lastMessage: {
                    message: res.data.message,
                    senderId: user,
                    createdAt: new Date(),
                  },
                }
              : c
          )
        );
      }
    } catch (err) {
      alert(err || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleStartNewChat = async (e) => {
    e.preventDefault();
    if (!selectedRecipientId || !initialMessageText.trim()) return;

    try {
      setStartingChat(true);
      const convRes = await api.post('/conversations', {
        receiverId: selectedRecipientId,
        conversationType: 'GENERAL',
      });

      if (convRes.success && convRes.data) {
        const conv = convRes.data;
        // Send initial message
        await api.post('/messages', {
          conversationId: conv._id,
          receiverId: selectedRecipientId,
          message: initialMessageText.trim(),
        });

        setNewChatModalOpen(false);
        setSelectedRecipientId('');
        setInitialMessageText('');
        await fetchConversations();
        setActiveConversation(conv);
      }
    } catch (err) {
      alert(err || 'Could not initiate conversation');
    } finally {
      setStartingChat(false);
    }
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find((p) => p._id !== user?._id) || conv.participants?.[0] || {};
  };

  return (
    <Layout pageTitle="Internal Messaging">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Placement Communications</h2>
          <p className="page-subtitle">Secure, audited cross-module chat between students, placement officers, and recruiters.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setNewChatModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <IconPlus size={16} /> New Conversation
        </button>
      </div>

      <div
        className="card"
        style={{
          padding: 0,
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          height: '700px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Left Side: Conversation List */}
        <div style={{ borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>Direct Channels</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8' }}>
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8', fontSize: '13px' }}>
                <IconMessageSquare size={32} className="mx-auto" style={{ opacity: 0.5, marginBottom: '10px' }} />
                No active conversations yet. Click "New Conversation" to start.
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isSelected = activeConversation?._id === conv._id;

                return (
                  <div
                    key={conv._id}
                    onClick={() => setActiveConversation(conv)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      background: isSelected ? '#eef2ff' : 'transparent',
                      borderLeft: isSelected ? '4px solid #4f46e5' : '4px solid transparent',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: isSelected ? '#4f46e5' : '#cbd5e1',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '14px',
                        }}
                      >
                        {other.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {other.name || 'User'}
                          </span>
                          <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '6px' }}>
                            {other.role?.replace('_', ' ')}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                          {conv.lastMessage?.message || 'No messages yet'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
          {activeConversation ? (
            <>
              {/* Header */}
              {(() => {
                const other = getOtherParticipant(activeConversation);
                return (
                  <div
                    style={{
                      padding: '16px 20px',
                      background: '#ffffff',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {other.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                          {other.name || 'User'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {other.email} • <span style={{ color: '#4f46e5', fontWeight: 600 }}>{other.role?.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Message Feed */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.length === 0 ? (
                  <div style={{ margin: 'auto', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
                    Send a message to start the conversation.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId?._id === user._id || m.senderId === user._id;
                    return (
                      <div
                        key={m._id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '10px 16px',
                            borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                            background: isMe ? '#4f46e5' : '#ffffff',
                            color: isMe ? '#ffffff' : '#1e293b',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                            fontSize: '14px',
                            lineHeight: 1.5,
                          }}
                        >
                          {m.message}
                        </div>
                        <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', padding: '0 4px' }}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '16px 20px',
                  background: '#ffffff',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                }}
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="form-control"
                  style={{ flex: 1, borderRadius: '24px', paddingLeft: '16px' }}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="btn btn-primary"
                  style={{ borderRadius: '24px', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <IconSend size={16} /> Send
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8' }}>
              <IconMessageSquare size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <h3>Select a channel</h3>
              <p style={{ fontSize: '13px' }}>Choose a contact from the left panel to review or send messages.</p>
            </div>
          )}
        </div>
      </div>

      {/* Start New Chat Modal */}
      {newChatModalOpen && (
        <Modal title="Start Direct Placement Chat" onClose={() => setNewChatModalOpen(false)}>
          <form onSubmit={handleStartNewChat}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Select Recipient *</label>
              <select
                className="form-control"
                value={selectedRecipientId}
                onChange={(e) => setSelectedRecipientId(e.target.value)}
                required
              >
                <option value="">-- Choose User --</option>
                {userList.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email}) — [{u.role?.replace('_', ' ')}]
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Initial Message *</label>
              <textarea
                rows={3}
                className="form-control"
                value={initialMessageText}
                onChange={(e) => setInitialMessageText(e.target.value)}
                placeholder="Write your opening message here..."
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setNewChatModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={startingChat}>
                {startingChat ? 'Initiating...' : 'Start Conversation'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
};

export default Messages;
