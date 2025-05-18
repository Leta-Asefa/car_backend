import express from "express";
import {
  login,
  register,
  logout,
  getAllUsers,
  getUnapprovedUsers,
  handleUserApproval,
  addSearchHistory,
  getSearchHistory,
  update,
  getApprovedUsers,
  handleUserSuspension,
  getSuspendedUsers,
  getUserSummary,
  addToWishList,
  getWishList
} from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/update", update);
router.get("/all", getAllUsers);
router.get("/unapproved", getUnapprovedUsers);
router.get("/approved", getApprovedUsers);
router.get("/suspended", getSuspendedUsers);
router.post("/approve", handleUserApproval);
router.post("/suspend", handleUserSuspension);
router.get("/getUserSummary/:days", getUserSummary);
router.post("/:userId/search_history", addSearchHistory);
router.get("/:userId/search_history", getSearchHistory);
router.post("/:userId/wishlist", addToWishList);
router.get("/:userId/wishlist", getWishList);

export default router;
