import mongoose, { Schema } from "mongoose";

const MemberSchema = new Schema({
  user_id: { type: String, required: true },
  user_name: { type: String, required: true },
  img_url: { type: String, default: "" },
});

const MessageSchema = new Schema({
  user_id: { type: String, required: true },
  content: { type: String, required: true },
  sent_at: { type: Date, required: true, default: Date.now },
  is_read: { type: Boolean, required: true, default: false },
});

const ChatSchema = new Schema({
  chat_type: { type: String, required: true, enum: ["private", "group"] },
  members: { type: [MemberSchema], required: true },
  created_at: { type: Date, default: Date.now },
  last_updated: { type: Date, default: Date.now },
  messages: { type: [MessageSchema], default: [] },
});

ChatSchema.index({ "members.user_id": 1 });

export default mongoose.model("Chat", ChatSchema);
