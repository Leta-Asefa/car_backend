import { Router } from "express";
import messageroute from "./message.js";
import authroute from "./auth.js";
import carrouter from "./car.js";
const router = Router();

router.use("/auth", authroute);
router.use("/conversations", async (req, res) => {
  const chats = await Chat.find();
  res.json(chats);
});
router.use("/car", carrouter);
router.use("/chat", messageroute);

export default router;
