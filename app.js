import express, { json } from "express";
import routes from "./routes/index.js";
import cors from "cors";
// import errorHandler from './middleware/errorHandler';

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    credentials: true, // Allow cookies/credentials if needed
  })
);
app.use(json());
app.use("/api", routes);
app.get("/", (req, res) => {
  res.json({ message: "hello" });
});
export default app;
