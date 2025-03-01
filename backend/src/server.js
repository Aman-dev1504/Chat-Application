// backend/src/server.js
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/database.js";
import app from "./app.js";
import handleSocketConnection from "./services/sockets/chatSocket.js";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Create HTTP server and integrate with socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Initialize Socket.io events
handleSocketConnection(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
