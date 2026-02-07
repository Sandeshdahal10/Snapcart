import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

dotenv.config();
const app=express();


const server=http.createServer(app);
const port=process.env.PORT||5000;
const io=new Server(server,{
  cors:{
    origin:process.env.NEXT_BASE_URL,
    methods:["GET","POST"]
  }
})
io.on("connection",(socket)=>{
  console.log("User Connected",socket.id);
  socket.on("identity",(userId)=>{
    console.log("User Identity Received:",userId);
  })
  
  socket.on("disconnect",()=>{
    console.log("User Disconnected",socket.id);
  })
})
server.listen(port,()=>{
    console.log(`Socket server is running on port ${port}`);
})
