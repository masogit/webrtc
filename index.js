const express = require("express");
const path = require("path");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let clients = []
const addClient = id => {
  if (clients.indexOf(item => item.id == id) < 0) {
    clients.push({ id, name: null })
  }
  return clients
}
const delClient = id => {
  clients = clients.filter(item => item.id != id)
  return clients
}
const setName = ({ id, name }) => {
  console.log('setName', { id, name }, clients)
  const _ = clients.find(item => item.id == id)
  if (_) {
    _.name = name
  }
}
const setCallName = ({ id, _id }) => {
  const self = clients.find(item => item.id == id)
  const to = clients.find(item => item.id == _id)
  if (self && to) {
    self.calling = to.name
    to.incoming = self.name
  }
}

app.get("/channel", (req, res) => {
  res.sendFile(__dirname + "/channel/index.html");
});
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.use(express.static(path.join(__dirname, "channel")));

io.on("connection", (socket) => {
  console.log("a user connected: socket.id", socket.id);
  socket.broadcast.emit("hi");
  io.emit("socket.id", addClient(socket.id))
  // io.emit("socket.id", addClient(socket.id));

  socket.on("disconnect", () => {
    io.emit("socket.id", delClient(socket.id));
    console.log("user disconnected", socket.id);
  });

  socket.on("setName", (name) => {
    setName({ id: socket.id, name })
    io.emit("socket.id", clients);
    // io.emit("chat message", msg);
  });

  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
    io.emit("chat message", msg);
  });

  socket.on("call-user", (data) => {
    socket.to(data.to).emit("call-made", {
      offer: data.offer,
      socket: data.from,
    });
  });
  socket.on("make-answer", (data) => {
    setCallName({ id: data.from, to: data.from })
    socket.to(data.to).emit("answer-made", {
      socket: data.from,
      answer: data.answer,
    });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
