'use strict';

const EventEmitter = require('events');
const net = require('net');
const logger = require('./logger');
const User = require('./../model/user');

const PORT = process.env.PORT || 3000;

const server = net.createServer();
const event = new EventEmitter();
const socketPool = {};


const parseData = (buffer) => {
  let text = buffer.toString().trim();
  if (!text.startsWith('@')) return null;
  text = text.split(' ');
  const [command] = text;
  // const message = message.join();??????
  const message = text.slice(1).join(' ');


  return {
    command,
    message,
  };
};
const dispatchAction = (user, buffer) => {
  const entry = parseData(buffer);
  if (entry) event.emit(entry.command, entry, user);
};

  // all the event listeners
event.on('@all', (data, user) => {
  logger.log(logger.INFO, data);
  Object.keys(socketPool).forEach((userIdKey) => {
    const targettedUser = socketPool[userIdKey];
    targettedUser.socket.write(`<${user.nickname}>: <${data.message}>\n`);
  });
});
event.on('@dm', (data, user) => {
  const username = data.message.indexOf(' ');
  const toUser = data.message.slice(0, username);
  Object.keys(socketPool).forEach((userIdKey) => {
    if (toUser === socketPool[userIdKey].nickname) {
      const targettedUser = socketPool[userIdKey];
      targettedUser.socket.write(`<${user.nickname}>: <${data.message.slice(username + 1)}>\n`);
    }
  });
});
event.on('@nick', (data, user) => {
  socketPool[user._id].nickname = data.message;
  user.socket.write(`You have changed your tag to ${data.message}!\n`);
});
event.on('@list', (data, user) => {
  Object.keys(socketPool).forEach((userIdKey) => {
    user.socket.write(`${socketPool[userIdKey].nickname}\n`);
  });
});
server.on('connection', (socket) => {
  const user = new User(socket);
  socket.write(`Welcome to the chatroom, ${user.nickname}! \n`);
  socketPool[user._id] = user;
  logger.log(logger.INFO, `A new user ${user.nickname} has entered the chatroom!\n`);

  socket.on('data', (buffer) => {
    dispatchAction(user, buffer);
  });
});

server.listen(PORT, () => {
  logger.log(logger.INFO, `Server is running at ${PORT}`);
});
