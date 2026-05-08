import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

function Chat({ socket, roomId, isDrawer }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.on('chat_message', (msg) => {
      setMessages(prev => [...prev, { type: 'chat', ...msg }]);
    });

    socket.on('correct_guess', ({ username, points }) => {
      setMessages(prev => [...prev, { type: 'correct', username, points }]);
    });

    socket.on('notification', (text) => {
      setMessages(prev => [...prev, { type: 'system', text }]);
    });

    socket.on('new_turn', () => {
      setMessages(prev => [...prev, { type: 'system', text: '🎨 New turn started!' }]);
    });

    return () => {
      socket.off('chat_message');
      socket.off('correct_guess');
      socket.off('notification');
      socket.off('new_turn');
    };
  }, [socket]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isDrawer) return;
    socket.emit('guess', { roomId, guess: input });
    setInput('');
  };

  return (
    <div className="chat-panel glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="chat-header">
         <span style={{ fontWeight: 800 }}>GUESS ARENA</span>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
            {msg.type === 'chat' && (
              <div className="msg-bubble">
                <span style={{ fontWeight: 800, color: 'var(--primary)', marginRight: '0.4rem' }}>{msg.username}:</span>
                <span>{msg.message}</span>
              </div>
            )}
            {msg.type === 'correct' && (
              <div className="msg-bubble msg-correct animate-fade">
                🎉 {msg.username} guessed it! (+{msg.points})
              </div>
            )}
            {msg.type === 'system' && (
              <div style={{ textAlign: 'center', margin: '0.2rem 0', color: 'var(--text-dim)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                {msg.text}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {!isDrawer ? (
        <form className="chat-form" onSubmit={handleSend}>
          <input 
            className="input-field"
            type="text" 
            placeholder="Type your guess..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn-game" style={{ padding: '0.6rem' }}>
            <Send size={18} />
          </button>
        </form>
      ) : (
        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', background: 'rgba(0,0,0,0.1)' }}>
          Drawing time! 🎨
        </div>
      )}
    </div>
  );
}

export default Chat;
