require('dotenv').config();
const express = require("express");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware')


connectDB();
const app = express();

app.use(express.json());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',  // your frontend URL from .env
  credentials: true,               // allow cookies, authorization headers
}));

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000


const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_URL || ' http://localhost:3000',  //Use same CLIENT_URL here too
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => {
    socket.in(room).emit("typing", room); //send room/chatId to clients
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing", room); //send room/chatId to clients
  });

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message received", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});