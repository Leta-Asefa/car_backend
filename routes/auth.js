import express from "express";
import {
  login,
  register,
  logout,
  getAllUsers,
  getUnapprovedUsers,
  handleUserApproval,
  addSearchHistory,
  getSearchHistory
} from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/all", getAllUsers);
router.get("/unapproved", getUnapprovedUsers);
router.post("/approve", handleUserApproval);
router.post("/:userId/search_history", addSearchHistory);
router.get("/:userId/search_history", getSearchHistory);

export default router;
