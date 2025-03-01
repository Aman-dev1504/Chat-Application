import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { loginSuccess } from "../redux/authSlice";
// import { getSocket } from "../utils/socket";
const apiUrl = import.meta.env.VITE_API_URL;

const RegisterLogin = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint =
        activeTab === "login" ? "/api/auth/login" : "/api/auth/register";
      const requestData =
        activeTab === "login"
          ? { email: formData.email, password: formData.password }
          : {
              name: formData.name,
              email: formData.email,
              password: formData.password,
            };
      const response = await axios.post(`${apiUrl}${endpoint}`, requestData);

      if (response.status === 200 || response.status === 201) {
        if (activeTab === "login") {
          const { user, token } = response.data;

          // const socket = getSocket();
          // socket.emit("login", user._id);
          dispatch(loginSuccess({ user, token }));
          toast.success("Login successful");
          navigate("/chat");
        } else {
          console.log(response.data);
          toast.success("Registration successful! Please log in.");
          setActiveTab("login");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-1 w-full justify-center dark:text-secondary">
              <IoChatbubbleEllipsesOutline color="#738bdc" />
              Chatroom
            </h1>
          </div>

          {/* Tabs */}
          <div className="relative flex bg-gray-200 rounded-lg p-1">
            <div
              className={`absolute top-1 bottom-1 left-1 w-1/2 bg-primary rounded-md transition-all duration-300 ${
                activeTab === "register" ? "translate-x-full" : "translate-x-0"
              }`}
            ></div>

            <button
              className={`relative flex-1 text-center py-2 z-10 transition-all duration-300 cursor-pointer ${
                activeTab === "login"
                  ? "text-white font-semibold"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={`relative flex-1 text-center py-2 z-10 transition-all duration-300 cursor-pointer ${
                activeTab === "register"
                  ? "text-white font-semibold"
                  : " text-gray-500"
              }`}
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {activeTab === "register" && (
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-secondary">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  className="input input-bordered w-full dark:text-secondary"
                  value={formData.name}
                  onChange={handleChange}
                  required={activeTab === "register"}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-secondary">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Your email"
                className="input input-bordered w-full dark:text-secondary"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-secondary">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Your password"
                className="input input-bordered w-full dark:text-secondary"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full rounded-md">
              {activeTab === "login" ? "Login" : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterLogin;
