import React, { useState, useEffect } from 'react';
import { Palette, Rocket, ShieldCheck, Plus, LogIn } from 'lucide-react';

function Lobby({ onJoin, error }) {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState('join'); // join, create

  useEffect(() => {
    if (mode === 'create') {
      const autoCode = Math.floor(100000 + Math.random() * 900000).toString();
      setRoomCode(autoCode);
    }
  }, [mode]);

  return (
    <div className="app-container" style={{ justifyContent: 'center' }}>
      <div style={{ maxWidth: '460px', width: '95%' }} className="glass-panel animate-fade">
        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)' }}>
          <button 
            onClick={() => setMode('join')}
            style={{ 
              flex: 1, padding: '1rem', border: 'none', background: mode === 'join' ? 'transparent' : 'rgba(0,0,0,0.1)', 
              color: mode === 'join' ? 'var(--primary)' : 'var(--text-dim)', fontWeight: 800, cursor: 'pointer',
              borderBottom: mode === 'join' ? '3px solid var(--primary)' : 'none', transition: '0.3s'
            }}
          >
            <LogIn size={18} style={{ marginRight: '0.5rem' }} /> JOIN ROOM
          </button>
          <button 
            onClick={() => setMode('create')}
            style={{ 
              flex: 1, padding: '1rem', border: 'none', background: mode === 'create' ? 'transparent' : 'rgba(0,0,0,0.1)', 
              color: mode === 'create' ? 'var(--primary)' : 'var(--text-dim)', fontWeight: 800, cursor: 'pointer',
              borderBottom: mode === 'create' ? '3px solid var(--primary)' : 'none', transition: '0.3s'
            }}
          >
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> CREATE ROOM
          </button>
        </div>

        <div style={{ padding: '2.5rem 2rem' }}>
          <h1 className="game-title" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2.5rem' }}>DRAW & GUESS</h1>
          
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            {mode === 'create' ? 'Start a new artistic battle!' : 'Join your friends in the arena!'} 🎨
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dim)', fontSize: '0.75rem' }}>YOUR NAME</label>
              <input 
                className="input-field"
                type="text" 
                placeholder="Artist name..." 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-dim)', fontSize: '0.75rem' }}>ROOM CODE</label>
              <div style={{ position: 'relative' }}>
                <input 
                  className="input-field"
                  type="text" 
                  placeholder="Ex: 123456" 
                  value={roomCode}
                  readOnly={mode === 'create'}
                  onChange={(e) => setRoomCode(e.target.value)}
                  style={{ background: mode === 'create' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(15, 23, 42, 0.6)', cursor: mode === 'create' ? 'default' : 'text' }}
                />
                {mode === 'create' && (
                  <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800 }}>AUTO-GENERATED</span>
                )}
              </div>
            </div>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.8rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                {error}
              </div>
            )}

            <button className="btn-game" style={{ marginTop: '1rem', padding: '1rem' }} onClick={() => onJoin(username, roomCode)}>
              <Rocket size={20} /> {mode === 'create' ? 'START ARENA' : 'ENTER ARENA'}
            </button>
          </div>
        </div>

        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.7rem' }}>
            <ShieldCheck size={14} /> Private & Secure
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.7rem' }}>
            <Palette size={14} /> 200+ Words
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
