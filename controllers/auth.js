import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Utility to create JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc Register a new user
export const register = async (req, res) => {
  const { username, email, password, role,phoneNumber } = req.body;
  console.log(username, email, password, role,phoneNumber);
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password, role,phoneNumber });

    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      phoneNumber:user.phoneNumber
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Login user
export const login = async (req, res) => {
  const { email, password } = req.body;
console.log(email, password);
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials !" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials !" });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Logout user
export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};


// GET: All users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

// GET: Unapproved users (e.g. role === "unapproved")
export const getUnapprovedUsers = async (req, res) => {
  try {
    const users = await User.find({ status: "unapproved" }).sort({ createdAt: -1 });
    console.log(users);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unapproved users." });
  }
};

// POST: Approve or decline user
export const handleUserApproval = async (req, res) => {
  const { userId, action } = req.body;

  if (!userId || !["approve", "decline"].includes(action)) {
    return res.status(400).json({ message: "Invalid request." });
  }

  try {
    if (action === "approve") {
      await User.findByIdAndUpdate(userId, { role: "user" }); // or "admin", if needed
    } else {
      await User.findByIdAndDelete(userId);
    }

    res.json({ message: `User ${action}d successfully.` });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user." });
  }
};

// POST: Add search history
export const addSearchHistory = async (req, res) => {
  console.log("add search history");
  const { userId } = req.params;
  const { brand, model, location, year,ownerId,carId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.searchHistory.unshift({ brand, model, location, year,ownerId,carId });
    await user.save();

    res.json({ message: "Search history added." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add search history." });
  }
};

// GET: Fetch search history by userId
export const getSearchHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId)
      .select("searchHistory")
      .populate("searchHistory.carId"); // ✅ nested path

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Optional: limit to latest 15 entries
    const limitedHistory = user.searchHistory
      .sort((a, b) => b.date - a.date) // sort by date descending
      .slice(0, 15); // limit to 15

    res.json(limitedHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch search history." });
  }
};



