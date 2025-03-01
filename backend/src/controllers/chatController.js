// // backend/src/controllers/chatController.js
// import Chat from "../models/Chat.js";

// export const createChat = async (req, res) => {
//   // Expects: { users: [userId1, userId2, ...] }
//   try {
//     const { users } = req.body;
//     if (!users || !Array.isArray(users) || users.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Users are required to create a chat" });
//     }
//     const chat = await Chat.create({ users });
//     res.status(201).json(chat);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getChats = async (req, res) => {
//   // Expects query: ?userId=...
//   try {
//     const { userId } = req.query;
//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }
//     const chats = await Chat.find({ users: userId }).populate(
//       "users",
//       "name email"
//     );
//     res.status(200).json(chats);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
