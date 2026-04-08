const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Check if we're being called from Electron or running standalone
if (require.main === module) {
  // Running standalone
  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server);

  // Serve static files from public directory
  app.use(express.static(path.join(__dirname, 'public')));

  // Initialize game server
  initializeGameServer(app, io);

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  // Being required by Electron
  module.exports = initializeGameServer;
}

function initializeGameServer(app, io) {
  // Store rooms and players
  const rooms = {};

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinRoom', (roomId, playerName) => {
      socket.join(roomId);

      if (!rooms[roomId]) {
        rooms[roomId] = {
          players: [],
          gameState: 'waiting',
          currentTurn: null,
          questions: [],
          guesses: []
        };
      }

      const room = rooms[roomId];

      if (room.players.length < 2) {
        room.players.push({
          id: socket.id,
          name: playerName,
          secretPerson: null,
          ready: false
        });

        socket.emit('joinedRoom', roomId, room.players.length);

        if (room.players.length === 2) {
          io.to(roomId).emit('roomFull', room.players);
          room.gameState = 'setup';
        }
      } else {
        socket.emit('roomFull');
      }
    });

    socket.on('setSecretPerson', (roomId, secretPerson) => {
      const room = rooms[roomId];
      if (!room) return;

      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.secretPerson = secretPerson;
        player.ready = true;

        // Check if both players are ready
        const readyPlayers = room.players.filter(p => p.ready);
        if (readyPlayers.length === 2) {
          room.gameState = 'playing';
          room.waitingForAnswer = false;
          // Randomly pick who starts
          const starterIndex = Math.floor(Math.random() * 2);
          room.currentTurn = room.players[starterIndex].id;
          io.to(roomId).emit('gameStart', room.players, room.currentTurn);
        }
      }
    });

    socket.on('askQuestion', (roomId, question) => {
      const room = rooms[roomId];
      if (!room || room.gameState !== 'playing' || room.currentTurn !== socket.id) return;
      if (room.waitingForAnswer) return; // already asked, must wait for answer

      room.waitingForAnswer = true;
      room.questions.push({
        player: socket.id,
        question: question,
        timestamp: Date.now()
      });

      // Send question to the other player — don't switch turn yet
      const otherPlayer = room.players.find(p => p.id !== socket.id);
      socket.to(otherPlayer.id).emit('questionAsked', question, socket.id);
    });

    socket.on('answerQuestion', (roomId, answer) => {
      const room = rooms[roomId];
      if (!room) return;

      // Send answer back to the asker
      const asker = room.players.find(p => p.id !== socket.id);
      io.to(asker.id).emit('questionAnswered', answer);

      // Now switch turn: the answerer becomes the next asker
      room.waitingForAnswer = false;
      room.currentTurn = socket.id;
      io.to(roomId).emit('turnChanged', room.currentTurn);
    });

    socket.on('makeGuess', (roomId, guess) => {
      const room = rooms[roomId];
      if (!room || room.gameState !== 'playing' || room.currentTurn !== socket.id) return;

      room.guesses.push({
        player: socket.id,
        guess: guess,
        timestamp: Date.now()
      });

      const otherPlayer = room.players.find(p => p.id !== socket.id);
      const correct = guess.toLowerCase() === otherPlayer.secretPerson.toLowerCase();

      if (correct) {
        room.gameState = 'finished';
        io.to(roomId).emit('gameOver', socket.id, guess);
      } else {
        socket.emit('wrongGuess', guess);
        // Continue game, turn stays with current player? Or switch?
        // In standard 20 questions, wrong guess might end turn or something, but let's switch turn
        room.currentTurn = otherPlayer.id;
        io.to(roomId).emit('turnChanged', room.currentTurn);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      // Remove player from rooms
      for (const roomId in rooms) {
        const room = rooms[roomId];
        room.players = room.players.filter(p => p.id !== socket.id);

        if (room.players.length === 0) {
          delete rooms[roomId];
        } else {
          io.to(roomId).emit('playerDisconnected');
          room.gameState = 'waiting';
        }
      }
    });
  });
}