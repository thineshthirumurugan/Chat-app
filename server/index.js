const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const userRoutes = require("./routes/userRoutes")
const messageRoute = require('./routes/messageRoute');
const socket = require("socket.io")

const app = express();
require("dotenv").config();

app.use(cors())
app.use(express.json())  // This middleware parses incoming JSON requests

app.use("/api/auth",userRoutes)
app.use('/api/messages', messageRoute);

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("DB Connection Successful...");
  }).catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    // Handle the error appropriately
  });
  

const server = app.listen(process.env.PORT,()=>{
    console.log(`Server Started on Port: ${process.env.PORT}`)
})


const io = socket(server,{
  cors:{
    origin :"http://localhost:3000",
    credentials : true,
  },
});

global.onlineUsers = new Map();

io.on("connection",(socket)=>{
  global.chatSocket = socket;
  socket.on("ad-user",(userId) => {
    onlineUsers.set(userId,socket.id)
  })

  socket.on("send-msg",(data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if(sendUserSocket){
      socket.to(sendUserSocket).emit("msg-recieve",data.message);
    }
  })
})