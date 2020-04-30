const io = require('socket.io')({
  serveClient: false,
});

const express = require('express')();
const cors = require('cors');
const http = require('http');

express.use(cors());
const server = http.Server(express);

io.attach(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});



server.listen(process.env.PORT || 3333, "0.0.0.0");

// const connected = [];
const connections = [];

io.on('connect', socket => {
  const { type } = socket.handshake.query;

  console.log(type, socket.id);

  socket.emit('connected', socket.id);
  
  socket.on('attach', target => {
    socket.to(target).emit('attach', socket.id);
  })

  socket.on('mouseMove', ({target, coordinates}) => {
    if(target){
      //console.log(`to: ${target} \nEmit: ${param}`);
      socket.to(target).emit('mouseMove', coordinates);
    }
  })

  socket.on('mouseClick', (target) => {
    if(target){
      //console.log(`to: ${target} \nEmit: ${param}`);
      socket.to(target).emit('mouseClick', socket.id);
    }
  })
  socket.on('keyPress', ({target, key}) => {
    if(target){
      //console.log(`to: ${target} \nEmit: ${param}`);
      socket.to(target).emit('keyPress', key);
    }
  })


});