import { Router } from "express";
import {
  getChats,
  createChat,
  getMessages,
  sendMessage,
  markMessagesRead,
} from "../controllers/chat.js";

const router = Router();

// Route handlers
router.get("/", getChats);
router.post("/", createChat);
router.get("/messages", getMessages);
router.post("/messages", sendMessage);
router.post("/messages/read", markMessagesRead);

export default router;
