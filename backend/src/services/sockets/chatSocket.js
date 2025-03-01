import Message from "../../models/Message.js";
import User from "../../models/User.js";

const onlineUsers = {}; // Track online users and their socket IDs

const handleSocketConnection = (io) => {
  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Handle user online status
    socket.on("login", async (userId) => {
      onlineUsers[userId] = socket.id;
      console.log("User online:", onlineUsers);
      await User.findByIdAndUpdate(userId, { online: true });
      socket.emit("getOnlineUsers", Object.keys(onlineUsers));
    });

    // Backend: Handle sending messages
    socket.on("send-message", async (data) => {
      const { sender, receiver, message } = data;

      try {
        const newMessage = new Message({
          sender: { _id: sender._id },
          receiver: { _id: receiver._id },
          message,
        });
        await newMessage.save();

        const receiverSocketId = onlineUsers[receiver._id];
        if (receiverSocketId) {
          console.log(
            "Emitting receive-message to receiver:",
            receiverSocketId
          );
          io.to(receiverSocketId).emit("receive-message", newMessage);
        }

        const senderSocketId = onlineUsers[sender._id];
        if (senderSocketId) {
          io.to(senderSocketId).emit("receive-message", newMessage);
        }
      } catch (err) {
        console.error("Error sending message:", err);
      }
    });

    socket.on("typing", (data) => {
      const { sender, receiver } = data;
      const receiverSocketId = onlineUsers[receiver];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { sender });
      }
    });

    socket.on("stopTyping", (data) => {
      const { sender, receiver } = data;
      const receiverSocketId = onlineUsers[receiver];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { sender });
      }
    });
    socket.on("userOffline", (userId) => {
      delete onlineUsers[userId];
      io.emit("updateUserStatus", { userId, status: "offline" });
    });
    socket.on("disconnect", async () => {
      console.log("A user disconnected:", socket.id);
      const userId = Object.keys(onlineUsers).find(
        (key) => onlineUsers[key] === socket.id
      );
      if (userId) {
        delete onlineUsers[userId]; // Remove user from online users
        await User.findByIdAndUpdate(userId, { online: false });

        // Emit user status update
        io.emit("updateUserStatus", { userId, status: "offline" });
      }
    });
  });
};

export default handleSocketConnection;
