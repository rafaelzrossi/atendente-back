const socketio = require('socket.io');
const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: (o, callback) => callback(null, true),
}));

const server = http.Server(app);

const io = socketio(server, { origins: ['*:*'] });

let clientFree = [];

io.on('connect', socket => {
  const { type, name } = socket.handshake.query;
  
  //console.log(type, socket.id);
  if(type === 'client' && name){
    // console.log(name)
    clientFree.push({id: socket.id, name});
    io.emit('getClients', clientFree);
  }
  
  socket.emit('connected', socket.id);

  socket.on('getClients', () => {
    socket.emit('getClients', clientFree);
  })

  socket.on('addClient', () => {
    clientFree.push({id: socket.id, name});
    io.emit('getClients', clientFree);
  })

  socket.on('keepAlive', (target) => {
    socket.to(target).emit('keepAlive', socket.id);
  })
  socket.on('setWindow', ({target, width, height}) => {
    socket.to(target).emit('setWindow', {width, height});
  })
  
  socket.on('attach', target => {
    clientFree = clientFree.filter(e => e.id !== target);
    socket.to(target).emit('attach', socket.id);
    io.emit('getClients', clientFree);
  })
  
  socket.on('setPath', ({target, pathname}) => {
    socket.to(target).emit('setPath', pathname);
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
  
  socket.on('disconnect', ()  => {
    clientFree = clientFree.filter(e => e.id !== socket.id);
    io.emit('getClients', clientFree);
    // console.log('Disconnecting : ', socket.id);
  });
  
});


server.listen(process.env.PORT || 3333, "0.0.0.0");