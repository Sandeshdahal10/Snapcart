import express from 'express';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();
const app=express();


const server=http.createServer(app);
const port=process.env.PORT||5000;
server.listen(port,()=>{
    console.log(`Socket server is running on port ${port}`);
})
