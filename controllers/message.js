import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { getReceiverSocketId, io } from "../sockets/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { message, senderId, isImage } = req.body;
    const { id: receiverId } = req.params;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      isImage:isImage || false
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    await newMessage.save();
    await conversation.save();

    // this will run in parallel
    await Promise.all([conversation.save(), newMessage.save()]);

    const populatedConversation = await conversation.populate([
      { path: "messages" },
      { path: "participants", select: "username phoneNumber" },
    ]);

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", { ...newMessage._doc, conversation: populatedConversation });
      console.log("emitted newMessage with populated messages", {...newMessage._doc,conversation:populatedConversation});
    }

    res.status(201).json({ ...newMessage.toObject(), conversation: populatedConversation });
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  console.log(req.params, req.user);
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id || "680ff2ae1c09d2da2c85aaaf";

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate(["messages", "participants"]); // Populate both messages and participants

    if (!conversation) return res.status(200).json([]);

    const messages = conversation.messages;

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getConversationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "-password") // optional: exclude sensitive fields
      .populate("messages");

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createConversations = async (req, res) => {
  console.log("create conversations hit" );
  try {
    const { userId, receiverId } = req.params;

    console.log("create conersation ", userId, receiverId);

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, receiverId],
      });
    }

    conversation.save();

    res.status(201).json({ message: "Conversation created successfully" });
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error : " + error });
  }
};
