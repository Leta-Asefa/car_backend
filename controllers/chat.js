import Chat from "../models/Chat.js";

// Fetch user's chats
export const getChats = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const chats = await Chat.find({
      "members.user_id": user_id,
    }).sort({ last_updated: -1 });

    res.json(chats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};

// Create a new chat
export const createChat = async (req, res) => {
  try {
    const { chat_type, members } = req.body;

    if (!chat_type || !members || !Array.isArray(members) || members.length < 2) {
      return res.status(400).json({ error: "Invalid chat creation data" });
    }

    if (chat_type === "private") {
      const existingChat = await Chat.findOne({
        chat_type: "private",
        "members.user_id": { $all: members.map(m => m.user_id) },
        $expr: { $eq: [{ $size: "$members" }, members.length] },
      });

      if (existingChat) {
        return res.status(200).json(existingChat);
      }
    }

    const newChat = new Chat({
      chat_type,
      members,
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (err) {
    console.error("Error creating chat:", err);
    res.status(500).json({ error: "Failed to create chat" });
  }
};

// Fetch chat messages
export const getMessages = async (req, res) => {
  try {
    const { chat_id, skip = 0, limit = 50 } = req.query;

    if (!chat_id) {
      return res.status(400).json({ error: "chat_id is required" });
    }

    const chat = await Chat.findById(chat_id, { messages: { $slice: [-limit, limit] } });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json(chat.messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { chat_id, user_id, content } = req.body;

    if (!chat_id || !user_id || !content) {
      return res.status(400).json({ error: "chat_id, user_id, and content are required" });
    }

    const chat = await Chat.findById(chat_id);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const isMember = chat.members.some(m => m.user_id === user_id);
    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this chat" });
    }

    const newMessage = {
      user_id,
      content,
      sent_at: new Date(),
      is_read: false,
    };

    chat.messages.push(newMessage);
    chat.last_updated = new Date();
    await chat.save();

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Mark messages as read
export const markMessagesRead = async (req, res) => {
  try {
    const { chat_id, user_id } = req.body;

    if (!chat_id || !user_id) {
      return res.status(400).json({ error: "chat_id and user_id are required" });
    }

    const chat = await Chat.findById(chat_id);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    chat.messages.forEach(msg => {
      if (msg.user_id !== user_id) {
        msg.is_read = true;
      }
    });

    await chat.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Error marking messages as read:", err);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
};
