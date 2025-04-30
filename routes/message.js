import express from "express";
import { getMessages, sendMessage,getConversationsByUserId } from "../controllers/message.js";

const router = express.Router();

router.get("/:id", getMessages);
router.get("/get_conversations/:userId", getConversationsByUserId);
router.post("/send/:id", sendMessage);

export default router;