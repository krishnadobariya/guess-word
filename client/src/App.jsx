import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Palette, Users, MessageSquare, Timer, Trophy, LogOut, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import './index.css';

// Components
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';

// Use production URL if deployed, else localhost
// Replace with your live Render/Railway URL after deploying the backend
const SOCKET_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://draw-guess-backend.onrender.com'; 


function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [gameState, setGameState] = useState('lobby'); // lobby, game, end
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('error_message', (msg) => setError(msg));
    
    newSocket.on('joined_successfully', ({ roomId, players }) => {
      setRoomId(roomId);
      setPlayers(players);
      setGameState('game');
    });

    newSocket.on('player_list', (list) => setPlayers(list));

    return () => newSocket.close();
  }, []);

  const handleJoin = (username, room) => {
    if (!username || !room) {
      setError('Please enter both username and room code');
      return;
    }
    setUser({ username });
    socket.emit('join_room', { roomId: room, username });
  };

  const handleStartGame = () => {
    socket.emit('start_game', roomId);
  };

  return (
    <div className="app-container">
      {gameState === 'lobby' ? (
        <Lobby onJoin={handleJoin} error={error} />
      ) : (
        <GameBoard 
          socket={socket} 
          user={user} 
          roomId={roomId} 
          players={players}
          onStart={handleStartGame}
        />
      )}
    </div>
  );
}

export default App;
