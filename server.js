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
  const pendingDisconnects = {}; // socketId -> {timer, roomId}

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
          guesses: [],
          scores: {}
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
        // Initialise score for this player (preserve if rejoining after restart)
        if (room.scores[socket.id] === undefined) room.scores[socket.id] = 0;

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
        // Reject if the opponent already picked the same player
        const opponent = room.players.find(p => p.id !== socket.id);
        if (opponent && opponent.secretPerson &&
            opponent.secretPerson.toLowerCase() === secretPerson.toLowerCase()) {
          socket.emit('samePlayerError');
          return;
        }

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

    socket.on('rejectQuestion', (roomId) => {
      const room = rooms[roomId];
      if (!room) return;

      // Find the rejected question (last one asked)
      const lastQuestion = room.questions[room.questions.length - 1];
      const questionText = lastQuestion ? lastQuestion.question : '';

      // Remove it from history so it doesn't count
      if (lastQuestion) room.questions.pop();

      // Clear the waiting state — turn stays with the original asker
      room.waitingForAnswer = false;
      // currentTurn stays the same (asker must ask again)

      // Notify the asker their question was rejected
      const asker = room.players.find(p => p.id !== socket.id);
      if (asker) io.to(asker.id).emit('questionRejected', questionText);
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
      const correct = otherPlayer && otherPlayer.secretPerson &&
        guess.toLowerCase() === otherPlayer.secretPerson.toLowerCase();
      const guesserPlayer = room.players.find(p => p.id === socket.id);
      const guesserName = guesserPlayer ? guesserPlayer.name : 'Player';

      // Broadcast guess to both players so it appears in both history panels
      io.to(roomId).emit('guessMade', guesserName, guess, correct, socket.id);

      if (correct) {
        room.gameState = 'finished';
        room.scores[socket.id] = (room.scores[socket.id] || 0) + 1;
        io.to(roomId).emit('gameOver', socket.id, guess, room.scores);
      } else {
        socket.emit('wrongGuess', guess);
        room.currentTurn = otherPlayer.id;
        io.to(roomId).emit('turnChanged', room.currentTurn);
      }
    });

    socket.on('restartGame', (roomId) => {
      const room = rooms[roomId];
      if (!room || room.players.length < 2) return;

      // Reset round state — scores survive
      room.gameState = 'setup';
      room.currentTurn = null;
      room.questions = [];
      room.guesses = [];
      room.waitingForAnswer = false;
      room.players.forEach(p => {
        p.secretPerson = null;
        p.ready = false;
      });

      // creatorId = first player who joined (index 0)
      const creatorId = room.players[0].id;
      io.to(roomId).emit('gameRestart', creatorId, room.scores);
    });

    socket.on('rejoinRoom', (roomId, playerName) => {
      const room = rooms[roomId];
      if (!room) { socket.emit('rejoinFailed'); return; }

      const playerEntry = room.players.find(p => p.name === playerName);
      if (!playerEntry) { socket.emit('rejoinFailed'); return; }

      const oldSocketId = playerEntry.id;

      // Cancel grace-period timer if it's still running
      if (pendingDisconnects[oldSocketId]) {
        clearTimeout(pendingDisconnects[oldSocketId].timer);
        delete pendingDisconnects[oldSocketId];
      }

      // Transfer scores and current turn to the new socket ID
      if (room.scores[oldSocketId] !== undefined) {
        room.scores[socket.id] = room.scores[oldSocketId];
        delete room.scores[oldSocketId];
      }
      if (room.currentTurn === oldSocketId) room.currentTurn = socket.id;
      playerEntry.id = socket.id;

      socket.join(roomId);

      socket.emit('rejoinSuccess', {
        roomId,
        gameState: room.gameState,
        currentTurn: room.currentTurn,
        waitingForAnswer: room.waitingForAnswer || false,
        players: room.players.map(p => ({ id: p.id, name: p.name })),
        scores: room.scores,
        mySecretPerson: playerEntry.secretPerson
      });

      io.to(roomId).emit('playerRejoined', playerName);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      const disconnectedId = socket.id;

      for (const roomId in rooms) {
        const room = rooms[roomId];
        const playerIndex = room.players.findIndex(p => p.id === disconnectedId);
        if (playerIndex === -1) continue;

        const playerName = room.players[playerIndex].name;
        // Notify opponent but give 30 s grace period for reconnection
        io.to(roomId).emit('playerTemporarilyDisconnected', playerName);

        const timer = setTimeout(() => {
          delete pendingDisconnects[disconnectedId];
          const idx = room.players.findIndex(p => p.id === disconnectedId);
          if (idx !== -1) {
            room.players.splice(idx, 1);
            if (room.players.length === 0) {
              delete rooms[roomId];
            } else {
              io.to(roomId).emit('playerDisconnected');
              room.gameState = 'waiting';
            }
          }
        }, 30000);

        pendingDisconnects[disconnectedId] = { timer, roomId };
      }
    });
  });
}