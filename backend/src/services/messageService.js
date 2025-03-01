// backend/src/services/messageService.js
import Message from "../models/Message.js";

export const sendMessageService = async (data) => {
  const message = await Message.create(data);
  return message;
};

export const getMessagesService = async (chatId) => {
  const messages = await Message.find({ chat: chatId })
    .populate("sender", "name email")
    .sort({ createdAt: 1 });
  return messages;
};
