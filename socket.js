const http = require('http');
const {Server} = require('socket.io');
const config = require('config');

// const loggerMiddleware = require('./middleware/loggerMiddleware');

const jwtUtil = require('./util/jwtUtil');

let socketsArr = [];

module.exports.prepare = (app) => {
  const server = http.createServer(app);

  const cors = {
    origin:
      config.get('env') === config.get('envVariables.prod')
        ? config.get('frontendURL')
        : '*',
  };

  const io = new Server(server, {
    cors,
  });

  const jwtMiddleware = (socket, next) => {
    const {token} = socket.handshake.query;
    // verify token
    const decodedObj = jwtUtil.verify(token);
    if (decodedObj) {
      next();
    } else {
      console.log('Socket cannot be authenticated');
    }
  };
  io.use(jwtMiddleware);

  const PORT = config.get('port') || 3001;
  server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));

  io.on('connection', (socket) => {
    console.log(`New client connected to socket`);

    socketsArr.push(socket);

    socket.on('disconnect', () => {
      console.log(`Client disconnected from socket`);
    });
  });

  return io;
};
