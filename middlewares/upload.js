import multer from "multer";

// Store file temporarily in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;