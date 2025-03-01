// backend/src/controllers/messageController.js
import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
  const { receiver, text } = req.body;
  const sender = req.user._id;

  try {
    // Check if receiver exists
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Create and save the message
    const newMessage = new Message({ sender, receiver, text });
    await newMessage.save();

    // Emit the message via Socket.IO (if needed)
    // io.to(receiver).emit("receive-message", newMessage);

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getConversation = async (req, res) => {
  const loggedInUserId = req.user._id;
  const otherUserId = req.params.userId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: loggedInUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: loggedInUserId },
      ],
    })
      .sort({ timestamp: 1 })
      .populate("sender receiver", "username");

    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Server error" });
  }
};
