import { Router } from "express";
import Chat from "../models/Chat.js";
import chatroute from "./chat.js";
import authroute from "./auth.js";
import carrouter from "./car.js";
const router = Router();

router.use("/auth", authroute);
router.use("/conversations", async (req, res) => {
  const chats = await Chat.find();
  res.json(chats);
});
router.use("/car", carrouter);
router.use("/chats", chatroute);

export default router;
