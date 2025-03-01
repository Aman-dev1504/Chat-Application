import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getAllUsers", protect, getAllUsers);

export default router;
