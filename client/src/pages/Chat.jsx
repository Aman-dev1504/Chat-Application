import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiMoreVertical } from "react-icons/fi";
import { IoMdLogOut } from "react-icons/io";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { IoMdSend } from "react-icons/io";
import { getSocket } from "../utils/socket";
import axiosInstance from "../utils/axiosInstance";

const Chat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/api/auth/getAllUsers");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchConversation = async () => {
    if (!selectedUser) return;
    try {
      const response = await axiosInstance.get(
        `/api/messages/${selectedUser._id}`
      );
      setConversation(response.data);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  // Send message
  const sendMessage = () => {
    if (message.trim() === "") return;

    const newMessage = {
      sender: { _id: user._id },
      receiver: { _id: selectedUser._id },
      message: message,
    };

    // Emit the message via Socket.IO
    const socket = getSocket();
    socket.emit("send-message", newMessage);

    setConversation((prev) => [
      ...prev,
      {
        ...newMessage,
        timestamp: new Date().toISOString(),
      },
    ]);

    setMessage("");
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchConversation();
  };
  useEffect(() => {
    fetchConversation();
  }, [selectedUser]);

  // Handle logout
  const handleLogout = () => {
    const socket = getSocket();
    socket.emit("userOffline", user?._id);
    dispatch(logout());
    toast.success(`Logout successful`);
    navigate("/auth");
  };

  // Check if a user is online
  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  // Socket.IO effects
  useEffect(() => {
    const socket = getSocket();

    // online status
    socket.emit("login", user?._id);
    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });
    //  new messages
    const handleReceiveMessage = (msg) => {
      console.log("New message received:", msg);
      if (msg.sender !== user._id) {
        if (
          msg.sender === selectedUser?._id ||
          msg.receiver === selectedUser?._id
        ) {
          setConversation((prev) => [...prev, msg]);
        }
      }
    };

    //  user status updates
    const handleUpdateUserStatus = (data) => {
      setOnlineUsers((prev) => {
        if (data.status === "online") {
          return [...prev, data.userId];
        } else {
          return prev.filter((id) => id !== data.userId);
        }
      });
    };

    // typing indicators
    const handleTyping = (data) => {
      if (data.sender === selectedUser?._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (data.sender === selectedUser?._id) {
        setIsTyping(false);
      }
    };

    // Add event listeners
    socket.on("receive-message", handleReceiveMessage);
    socket.on("updateUserStatus", handleUpdateUserStatus);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    // Cleanup on unmount or when selectedUser changes
    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("updateUserStatus", handleUpdateUserStatus);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("getOnlineUsers");
    };
  }, [selectedUser]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-6xl flex flex-col sm:flex-row overflow-hidden">
        {/* Left sidebar */}
        <div className="w-full sm:w-80 bg-base-100 border-r border-base-300">
          {/* User info */}
          <div className="p-4 flex items-center justify-between border-b border-base-300">
            <div className="flex items-center">
              <div
                className={`avatar ${
                  user?.online ? "avatar-online" : "avatar-offline"
                }`}
              >
                <div className="w-10 rounded-full">
                  <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="ml-3 font-medium">{user?.name}</span>
                <span className="ml-3 text-xs text-neutral">{user?.email}</span>
              </div>
            </div>
            <div className="flex space-x-2 items-center justify-center">
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-gray-200 transition duration-200 cursor-pointer"
                  onClick={() => setShowLogout(!showLogout)}
                >
                  <FiMoreVertical className="w-5 h-5 text-gray-700" />
                </button>

                {showLogout && (
                  <div className="absolute right-0 mt-2 w-28 bg-white shadow-lg rounded-md border border-gray-200 z-10">
                    <button
                      className="w-full px-2 py-3 text-sm text-red-600 hover:bg-red-50 transition duration-200 flex items-center justify-center gap-1"
                      onClick={handleLogout}
                    >
                      <IoMdLogOut />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative form-control">
              <div className="input input-bordered flex items-center pr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-base-content opacity-70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  className="grow bg-transparent border-none focus:outline-none pl-2"
                />
              </div>
            </div>
          </div>

          {/* Contacts list */}
          <div className="overflow-y-auto h-96 sm:h-[calc(100vh-16rem)]">
            {users?.map((contact) => (
              <div
                key={contact._id}
                className={`flex items-center p-4 hover:bg-base-200 cursor-pointer ${
                  selectedUser && selectedUser._id === contact._id
                    ? "bg-base-200"
                    : ""
                }`}
                onClick={() => handleUserSelect(contact)}
              >
                <div className="avatar">
                  <div className="w-10 rounded-full">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      alt={`${contact.name} avatar`}
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">{contact.name}</span>
                    {isUserOnline(contact._id) && (
                      <span className="text-xs text-green-500">Online</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
            {selectedUser ? (
              <div className="flex items-center">
                <div
                  className={`avatar ${
                    isUserOnline(selectedUser._id) ? "avatar-online" : ""
                  }`}
                >
                  <div className="w-10 rounded-full">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      alt="Contact avatar"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-xs opacity-70">
                    {isUserOnline(selectedUser._id) ? "Active Now" : "Offline"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="ml-3">
                  <div className="font-medium">
                    Select a user to start chatting
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-base-100 h-96 sm:h-[calc(100vh-20rem)]">
            <div className="flex flex-col space-y-4">
              {conversation.map((msg) => (
                <div
                  key={msg._id}
                  className={`chat ${
                    msg.sender._id === user._id ? "chat-end" : "chat-start"
                  }`}
                >
                  <div className="chat-image avatar">
                    <div className="w-8 rounded-full">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        alt={`${
                          msg.sender._id === user._id
                            ? user.name
                            : selectedUser.name
                        } avatar`}
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="chat-header">
                    {msg.sender._id === user._id
                      ? user.name
                      : selectedUser.name}
                    <time className="text-xs opacity-70 ml-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </time>
                  </div>
                  <div
                    className={`chat-bubble ${
                      msg.sender._id === user._id
                        ? "chat-bubble-primary"
                        : "chat-bubble-accent"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="chat chat-start">
                  <div className="chat-image avatar">
                    <div className="w-8 rounded-full">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        alt="Contact avatar"
                      />
                    </div>
                  </div>
                  <div className="chat-bubble chat-bubble-accent min-h-8 flex items-center">
                    <span className="loading loading-dots loading-xs"></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message input */}
          <div className="p-4 bg-base-200 border-t border-base-300">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  const socket = getSocket();
                  socket.emit("typing", {
                    sender: user._id,
                    receiver: selectedUser._id,
                  });
                }}
                onBlur={() => {
                  const socket = getSocket();
                  socket.emit("stopTyping", {
                    sender: user._id,
                    receiver: selectedUser._id,
                  });
                }}
                placeholder="Type a message"
                className="input input-bordered mx-2 flex-1"
              />

              <button
                type="submit"
                className="btn btn-circle btn-secondary btn-sm"
              >
                <IoMdSend size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
