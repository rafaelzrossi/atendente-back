const socketio = require('socket.io');
const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: (o, callback) => callback(null, true),
}));

const server = http.Server(app);

io = socketio(server, { origins: '*:*' });

// io.attach(server, {
//   pingInterval: 10000,
//   pingTimeout: 5000,
//   cookie: false
// });


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


server.listen(process.env.PORT || 3333, "0.0.0.0");