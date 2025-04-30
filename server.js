import { createServer } from "http";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import { server,io,app } from "./sockets/socket.js";

dotenv.config();


connectDB().then(() => {
  server.listen(4000, () => {
    console.log(`Server running on port 4000`);
  });
});
