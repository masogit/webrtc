const express = require("express");
const path = require("path");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let clients = []
const addClient = id => {
  if (clients.indexOf(id) < 0) {
    clients.push(id)
  }
  return clients
}
const delClient = id => {
  clients = clients.filter(_ => _ != id)
  return clients
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
  io.emit("socket.id", addClient(socket.id));

  socket.on("disconnect", () => {
    io.emit("socket.id", delClient(socket.id));
    console.log("user disconnected", socket.id);
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
    socket.to(data.to).emit("answer-made", {
      socket: data.from,
      answer: data.answer,
    });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
