// backend/src/services/authService.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async ({ name, email, password }) => {
  const user = await User.create({ name, email, password });
  return user;
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return { user, token };
  }
  throw new Error("Invalid credentials");
};
