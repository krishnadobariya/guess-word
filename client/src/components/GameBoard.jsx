import React, { useState, useEffect, useRef } from 'react';
import { Timer, MessageSquare, Users, Palette, Crown, Info, Play, Sparkles, Share2, Settings, Globe, Clock } from 'lucide-react';
import Canvas from './Canvas';
import Chat from './Chat';
import Scoreboard from './Scoreboard';
import confetti from 'canvas-confetti';

function GameBoard({ socket, user, roomId, players, onStart }) {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentDrawer, setCurrentDrawer] = useState(null);
  const [word, setWord] = useState('');
  const [timer, setTimer] = useState(60);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [hint, setHint] = useState('');
  const [winner, setWinner] = useState(null);
  const [drawerName, setDrawerName] = useState('');
  const [wordChoices, setWordChoices] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [shouldShake, setShouldShake] = useState(false);
  const [settings, setSettings] = useState({ wordType: 'english', turnTime: 60 });
  const [showSettings, setShowSettings] = useState(false);

  const audioRef = useRef({
    correct: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
    tick: new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'),
    win: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3')
  });

  useEffect(() => {
    socket.on('joined_successfully', ({ settings: initialSettings }) => {
      if (initialSettings) setSettings(initialSettings);
    });

    socket.on('settings_updated', (newSettings) => {
      setSettings(newSettings);
      setTimer(newSettings.turnTime);
    });

    socket.on('new_turn', ({ drawerId, round, totalRounds, drawerName }) => {
      setIsGameStarted(true);
      setCurrentDrawer(drawerId);
      setRound(round);
      setTotalRounds(totalRounds);
      setDrawerName(drawerName);
      setWord('');
      setWordChoices(null);
      setHint('');
      setWinner(null);
      setShowSettings(false);
    });

    socket.on('word_choices', (choices) => {
      setWordChoices(choices);
    });

    socket.on('word_assigned', (assignedWord) => {
      setWord(assignedWord);
      setWordChoices(null);
    });

    socket.on('timer_update', (timeLeft) => {
      setTimer(timeLeft);
      if (timeLeft <= 10 && timeLeft > 0) {
        audioRef.current.tick.play().catch(() => {});
      }
    });

    socket.on('new_reaction', (reaction) => {
      setReactions(prev => [...prev, reaction]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 3000);
    });

    socket.on('correct_guess', ({ username }) => {
      audioRef.current.correct.play().catch(() => {});
      if (username === user.username) {
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 500);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#10b981', '#ffffff']
        });
      }
    });

    socket.on('game_end', (sortedPlayers) => {
      setWinner(sortedPlayers[0]);
      setIsGameStarted(false);
      audioRef.current.win.play().catch(() => {});
      confetti({ particleCount: 300, spread: 120, origin: { y: 0.6 } });
    });

    return () => {
      socket.off('joined_successfully');
      socket.off('settings_updated');
      socket.off('new_turn');
      socket.off('word_choices');
      socket.off('word_assigned');
      socket.off('timer_update');
      socket.off('new_reaction');
      socket.off('correct_guess');
      socket.off('game_end');
    };
  }, [socket, user.username]);

  const selectWord = (w, difficulty) => {
    socket.emit('select_word', { roomId, word: w, difficulty });
  };

  const sendReaction = (emoji) => {
    socket.emit('reaction', { roomId, emoji });
  };

  const updateSettings = (newSettings) => {
    socket.emit('update_settings', { roomId, settings: newSettings });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room code copied to clipboard! 📋');
  };

  const isDrawer = socket.id === currentDrawer;
  const isOwner = players.length > 0 && players[0].id === socket.id;

  if (winner) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="glass-panel animate-fade" style={{ maxWidth: '500px', width: '100%', padding: '4rem 2rem', textAlign: 'center' }}>
          <Crown size={80} color="var(--warning)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '3rem', marginBottom: '0.5rem', fontFamily: 'Fredoka One' }}>CHAMPION!</h2>
          <h3 style={{ color: 'var(--accent)', fontSize: '2rem' }}>{winner.username}</h3>
          <p style={{ color: 'var(--warning)', fontWeight: 800, marginBottom: '2rem' }}>{winner.title}</p>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '2.5rem', fontWeight: 900 }}>{winner.score} PTS</p>
          </div>
          <button className="btn-game" style={{ margin: '0 auto' }} onClick={() => window.location.reload()}>PLAY AGAIN</button>
        </div>
      </div>
    );
  }

  return (
    <div className={shouldShake ? 'shake' : ''} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="reaction-container">
        {reactions.map(r => (
          <div key={r.id} className="floating-emoji" style={{ '--random-x': `${Math.random() * 100 - 50}px`, left: '50%' }}>
            {r.emoji}
          </div>
        ))}
      </div>

      <div className="game-grid animate-fade">
        <div className="sidebar-panel">
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 800 }}>ROOM CODE</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>{roomId}</div>
            </div>
            <button 
              onClick={copyRoomCode}
              style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
            >
              <Share2 size={18} />
            </button>
          </div>
          <Scoreboard players={players} currentDrawer={currentDrawer} />
        </div>

        <div className="main-canvas-area">
          <div className="canvas-header glass-panel">
            <div className="timer-box">
              <Timer size={18} /> {timer}s
            </div>
            <div className="word-box">
              {isDrawer ? (
                <span style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>{word ? word.toUpperCase() : 'SELECT A WORD...'}</span>
              ) : (
                <span style={{ fontSize: '1.4rem' }}>{word ? (hint || word.replace(/./g, '_ ')) : 'WAITING FOR WORD...'}</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>RND</span>
              <span style={{ fontWeight: 900 }}>{round}/{totalRounds}</span>
            </div>
          </div>

          <div className="canvas-wrapper">
            {isDrawer && wordChoices && !word && (
              <div className="modal-overlay">
                <Sparkles size={48} color="var(--warning)" />
                <h2 style={{ fontFamily: 'Fredoka One', marginTop: '1rem' }}>PICK YOUR CHALLENGE</h2>
                <div className="word-choices">
                  <div className="word-choice-card difficulty-easy" onClick={() => selectWord(wordChoices.easy, 'easy')}>
                    <h3 style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>EASY</h3>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>{wordChoices.easy}</p>
                  </div>
                  <div className="word-choice-card difficulty-medium" onClick={() => selectWord(wordChoices.medium, 'medium')}>
                    <h3 style={{ color: 'var(--warning)', fontSize: '0.9rem' }}>MEDIUM</h3>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>{wordChoices.medium}</p>
                  </div>
                  <div className="word-choice-card difficulty-hard" onClick={() => selectWord(wordChoices.hard, 'hard')}>
                    <h3 style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>HARD</h3>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>{wordChoices.hard}</p>
                  </div>
                </div>
              </div>
            )}

            {!isGameStarted ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1e293b' }}>
                <Users size={64} color="var(--primary)" />
                <h3 style={{ fontSize: '1.8rem', marginTop: '1rem', fontFamily: 'Fredoka One' }}>LOBBY</h3>
                
                {isOwner && (
                   <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1.5rem', width: '320px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 800, fontSize: '0.85rem' }}>
                         <Settings size={16} /> GAME SETTINGS
                      </div>
                      
                      <div style={{ marginBottom: '1rem' }}>
                         <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>WORD DICTIONARY</label>
                         <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => updateSettings({ wordType: 'english' })}
                              className={`tool-btn ${settings.wordType === 'english' ? 'active' : ''}`} style={{ flex: 1, height: '40px' }}
                            >
                              <Globe size={14} style={{ marginRight: '4px' }} /> EN
                            </button>
                            <button 
                              onClick={() => updateSettings({ wordType: 'indian' })}
                              className={`tool-btn ${settings.wordType === 'indian' ? 'active' : ''}`} style={{ flex: 1, height: '40px' }}
                            >
                              🇮🇳 IND
                            </button>
                         </div>
                      </div>

                      <div>
                         <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>GUESS TIME: {settings.turnTime}s</label>
                         <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {[30, 60, 90].map(t => (
                               <button 
                                 key={t}
                                 onClick={() => updateSettings({ turnTime: t })}
                                 className={`tool-btn ${settings.turnTime === t ? 'active' : ''}`} style={{ flex: 1, height: '40px' }}
                               >
                                 {t}s
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>
                )}

                <button 
                  className="btn-game" 
                  onClick={onStart} 
                  style={{ marginTop: '2rem', padding: '1rem 3rem' }}
                  disabled={!isOwner && players.length < 2}
                >
                  <Play size={24} /> {isOwner ? 'START GAME' : 'WAITING FOR OWNER...'}
                </button>
              </div>
            ) : (
              <div style={{ height: '100%', position: 'relative' }}>
                <Canvas socket={socket} roomId={roomId} isDrawer={isDrawer} />
                <div className="emoji-bar">
                  {['🔥', '😂', '👏', '🧐', '🎨', '💖'].map(e => (
                    <button key={e} className="emoji-btn" onClick={() => sendReaction(e)}>{e}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="chat-panel">
          <Chat socket={socket} roomId={roomId} isDrawer={isDrawer} />
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
