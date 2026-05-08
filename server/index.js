const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const rooms = {};

const wordLists = {
  english: {
    easy: ['apple', 'cat', 'dog', 'sun', 'tree', 'book', 'fish', 'ball', 'cake', 'star'],
    medium: ['guitar', 'bicycle', 'elephant', 'laptop', 'mountain', 'pizza', 'umbrella', 'volcano', 'penguin', 'robot'],
    hard: ['architecture', 'symphony', 'renaissance', 'microscope', 'galaxy', 'equilibrium', 'metamorphosis', 'hieroglyphics', 'labyrinth', 'orchestra']
  },
  indian: {
    easy: ['samosa', 'chai', 'mango', 'peacock', 'lotus', 'temple', 'diya', 'rangoli', 'turban', 'henna'],
    medium: ['rickshaw', 'cricket', 'bollywood', 'himalayas', 'taj mahal', 'elephant', 'bangle', 'curry', 'monsoon', 'kabaddi'],
    hard: ['bharatnatyam', 'kathakali', 'ganesh chaturthi', 'ayurveda', 'dharamshala', 'varanasi', 'yoga', 'satyameva jayate', 'ashoka chakra', 'bhagavad gita']
  }
};

function getWordChoices(type = 'english') {
  const list = wordLists[type] || wordLists.english;
  return {
    easy: list.easy[Math.floor(Math.random() * list.easy.length)],
    medium: list.medium[Math.floor(Math.random() * list.medium.length)],
    hard: list.hard[Math.floor(Math.random() * list.hard.length)]
  };
}

function startTimer(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  room.timer = room.settings.turnTime;
  room.interval = setInterval(() => {
    if (room.timer > 0) {
      room.timer--;
      io.to(roomId).emit('timer_update', room.timer);
      
      if (room.timer === Math.floor(room.settings.turnTime / 2) && room.word) {
        const hint = room.word[0] + room.word.slice(1).replace(/./g, ' _');
        io.to(roomId).emit('hint', hint);
      }
    } else {
      clearInterval(room.interval);
      handleTurnEnd(roomId);
    }
  }, 1000);
}

function handleTurnEnd(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  clearInterval(room.interval);
  
  room.currentTurnIndex++;
  if (room.currentTurnIndex >= room.players.length) {
    room.currentRound++;
    room.currentTurnIndex = 0;
  }

  if (room.currentRound > 3) {
    room.players.forEach(player => {
      player.level = Math.floor(player.score / 500) + 1;
      if (player.score > 2000) player.title = 'Grand Master Artist';
      else if (player.score > 1000) player.title = 'Pro Painter';
      else if (player.score > 500) player.title = 'Sketch Artist';
      else player.title = 'Doodle Apprentice';
    });
    
    io.to(roomId).emit('game_end', room.players.sort((a, b) => b.score - a.score));
    delete rooms[roomId];
  } else {
    startNewTurn(roomId);
  }
}

function startNewTurn(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  room.word = '';
  room.difficulty = 'easy';
  room.drawer = room.players[room.currentTurnIndex].id;
  room.guesses = [];
  
  const choices = getWordChoices(room.settings.wordType);
  room.choices = choices;

  io.to(roomId).emit('new_turn', {
    drawerId: room.drawer,
    round: room.currentRound,
    totalRounds: 3,
    drawerName: room.players[room.currentTurnIndex].username
  });

  io.to(room.drawer).emit('word_choices', choices);
  
  room.selectionTimeout = setTimeout(() => {
    if (!room.word) {
      room.word = choices.easy;
      room.difficulty = 'easy';
      io.to(room.drawer).emit('word_assigned', room.word);
      startTimer(roomId);
    }
  }, 15000);
}

io.on('connection', (socket) => {
  socket.on('join_room', ({ roomId, username }) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        currentTurnIndex: 0,
        currentRound: 1,
        word: '',
        difficulty: 'easy',
        drawer: null,
        timer: 60,
        interval: null,
        settings: {
          wordType: 'english',
          turnTime: 60
        }
      };
    }

    const player = {
      id: socket.id,
      username,
      score: 0,
      level: 1,
      title: 'Doodle Apprentice'
    };

    rooms[roomId].players.push(player);
    io.to(roomId).emit('player_list', rooms[roomId].players);
    socket.emit('joined_successfully', { roomId, players: rooms[roomId].players, settings: rooms[roomId].settings });
    socket.to(roomId).emit('notification', `${username} joined the party! 🎈`);
  });

  socket.on('update_settings', ({ roomId, settings }) => {
    const room = rooms[roomId];
    if (room && room.players[0].id === socket.id) {
      room.settings = { ...room.settings, ...settings };
      io.to(roomId).emit('settings_updated', room.settings);
    }
  });

  socket.on('start_game', (roomId) => {
    const room = rooms[roomId];
    if (room && room.players.length >= 1) {
      startNewTurn(roomId);
    } else {
      socket.emit('error_message', 'Need at least 1 player to start!');
    }
  });

  socket.on('select_word', ({ roomId, word, difficulty }) => {
    const room = rooms[roomId];
    if (room && socket.id === room.drawer && !room.word) {
      clearTimeout(room.selectionTimeout);
      room.word = word;
      room.difficulty = difficulty;
      io.to(room.drawer).emit('word_assigned', word);
      startTimer(roomId);
    }
  });

  socket.on('draw', ({ roomId, data }) => {
    socket.to(roomId).emit('draw_data', data);
  });

  socket.on('clear_canvas', (roomId) => {
    socket.to(roomId).emit('clear_canvas');
  });

  socket.on('reaction', ({ roomId, emoji }) => {
    io.to(roomId).emit('new_reaction', { emoji, id: Math.random() });
  });

  socket.on('guess', ({ roomId, guess }) => {
    const room = rooms[roomId];
    if (!room || !room.word || socket.id === room.drawer) return;

    const player = room.players.find(p => p.id === socket.id);
    if (guess.toLowerCase().trim() === room.word.toLowerCase()) {
      if (!room.guesses.includes(socket.id)) {
        room.guesses.push(socket.id);
        
        const basePoints = { easy: 100, medium: 200, hard: 500 };
        const timeBonus = Math.floor(room.timer / 2);
        const points = basePoints[room.difficulty] + timeBonus;
        
        player.score += points;
        
        const drawer = room.players.find(p => p.id === room.drawer);
        if (drawer) drawer.score += Math.floor(points / 2);

        io.to(roomId).emit('player_list', room.players);
        io.to(roomId).emit('correct_guess', { username: player.username, points });
        
        if (room.guesses.length === room.players.length - 1) {
          handleTurnEnd(roomId);
        }
      }
    } else {
      io.to(roomId).emit('chat_message', { username: player.username, message: guess });
    }
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        if (room.players.length === 0) {
          clearInterval(room.interval);
          delete rooms[roomId];
        } else {
          io.to(roomId).emit('player_list', room.players);
          if (socket.id === room.drawer) handleTurnEnd(roomId);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
