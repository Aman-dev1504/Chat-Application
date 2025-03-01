// backend/src/services/chatService.js
import Chat from "../models/Chat.js";

export const createChatService = async (users) => {
  const chat = await Chat.create({ users });
  return chat;
};

export const getChatsService = async (userId) => {
  const chats = await Chat.find({ users: userId }).populate(
    "users",
    "name email"
  );
  return chats;
};
