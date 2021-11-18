const express = require('express');
const path = require('path');
const db = require('./db/db');
const socket = require('socket.io');

const app = express();

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '/client')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});

app.use((req, res) => {
  res.status(404).send('404 not found...');
})

const server = app.listen(8000, () => {
  console.log('Server is running on port: 8000')
});


const removeFromDB = (db, id) => {
  let indexToRemove = 0;
  for (let i = 0; i < db.length; i++) {
    if (db[i].id === id) {
      indexToRemove = i;
    }
  }
  db.splice(indexToRemove, 1);
};

const findInDB = (db, id) => {
  for (let i = 0; i < db.length; i++) {
    if (db[i].id === id) {
      return db[i].author;
    }
  }
};

const io = socket(server); // server zapisany pod stala

io.on('connection', (socket) => {
  console.log('New client! It\'s id - ' + socket.id);

  socket.on('message', (message) => {
    console.log('Oh, I\'ve got something from ' + socket.id);
    db.messages.push(message);
    socket.broadcast.emit('message', message);
  });

  socket.on('join', (join) => {
    console.log('Dodalem uzytkownika: ', join);
    const userId = { author: join.author, id: socket.id };
    db.users.push(userId);
  });

  socket.on('chatBotInfo', (botInfo) => {
    socket.broadcast.emit('chatBotInfo', botInfo);

  });

  socket.on('disconnect', () => {
    console.log('Oh, socket ' + socket.id + ' has left');
    let userOut = findInDB(db.users, socket.id);
    //inaczej po odswiezeniu pokazuje chatbot undefined
    if (userOut) {
      socket.broadcast.emit('out', { author: 'Chat Bot', content: `${userOut} has left the conversation!` });
    }
    removeFromDB(db.users, socket.id);



  });

  console.log('I\'ve added a listener on message event \n');
});
