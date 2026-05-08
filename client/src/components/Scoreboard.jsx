import React from 'react';
import { Palette, Crown, Users } from 'lucide-react';

function Scoreboard({ players, currentDrawer }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  const colors = [
    '#ef4444', '#3b82f6', '#10b981', 
    '#f59e0b', '#8b5cf6', '#ec4899'
  ];

  return (
    <div className="glass-panel" style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '0.85rem' }}>
          <Users size={16} /> PLAYERS
        </h4>
        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem' }}>
          {players.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {sortedPlayers.map((player, index) => (
          <div 
            key={player.id} 
            className={`player-card ${player.id === currentDrawer ? 'active-drawer' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem', borderRadius: '12px' }}
          >
            <div 
              className="player-avatar" 
              style={{ background: colors[index % colors.length], width: '32px', height: '32px', fontSize: '0.9rem', flexShrink: 0 }}
            >
              {index === 0 && sortedPlayers[0].score > 0 ? (
                <Crown size={16} />
              ) : (
                player.username.charAt(0).toUpperCase()
              )}
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', overflow: 'hidden' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.username}</span>
                {player.id === currentDrawer && <Palette size={12} color="var(--warning)" style={{ flexShrink: 0 }} />}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                <span className="level-badge">L{Math.floor(player.score / 500) + 1}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {player.id === currentDrawer ? 'DRAWING' : (player.title || 'Doodle Apprentice')}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 900, color: player.score > 0 ? 'var(--accent)' : 'var(--text-dim)', fontSize: '0.9rem' }}>
                {player.score}
              </div>
              <div style={{ fontSize: '0.5rem', color: 'var(--text-dim)' }}>PTS</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Scoreboard;
