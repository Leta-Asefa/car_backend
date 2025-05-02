import express from "express";
import { getMessages, sendMessage,getConversationsByUserId,createConversations } from "../controllers/message.js";

const router = express.Router();

router.get("/:id", getMessages);
router.get("/get_conversations/:userId", getConversationsByUserId);
router.get("/create_conversations/:userId/:receiverId", createConversations);
router.post("/send/:id", sendMessage);

export default router;