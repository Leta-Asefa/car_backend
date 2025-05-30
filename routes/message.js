import express from "express";
import { getMessages, sendMessage,getConversationsByUserId,createConversations, getConversationId } from "../controllers/message.js";

const router = express.Router();

router.get("/:id", getMessages);
router.get("/get_conversations/:userId", getConversationsByUserId);
router.get("/get_conversations_id/:userId/:sellerId", getConversationId);
router.get("/create_conversations/:userId/:receiverId", createConversations);
router.post("/send/:id", sendMessage);

export default router;