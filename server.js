import { createServer } from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import { setupSocket } from "./sockets/socket.js";

dotenv.config();

const server = createServer(app);

// Correct function name
setupSocket(server);

connectDB().then(() => {
  server.listen(4000, () => {
    console.log(`Server running on port 4000`);
  });
});
