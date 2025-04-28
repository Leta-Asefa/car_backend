import { Server } from "socket.io";

let io; // Initially undefined

export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_chat", (chat_id) => {
      socket.join(chat_id);
    });

    socket.on("send_message", ({ chat_id, message }) => {
      io.to(chat_id).emit("receive_message", message);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

// Export a function to get the current io instance
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call setupSocket first.");
  }
  return io;
};
