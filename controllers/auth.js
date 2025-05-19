import User from "../models/User.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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
      phoneNumber:user.phoneNumber,
      searchHistory: user.searchHistory,
      status:user.status,
      wishList:user.wishList,
      socialMedia:user.socialMedia
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
      phoneNumber:user.phoneNumber,
      searchHistory: user.searchHistory,
      status:user.status,
      wishList:user.wishList,
      socialMedia:user.socialMedia
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



export const update = async (req, res) => {
  const { userId,username, phoneNumber, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Password update check
    if (oldPassword && newPassword) {
      const isMatch = await user.matchPassword(oldPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      user.password = newPassword; // no need to hash manually
    }

    // Update fields
    if (username) user.username = username;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (req.body.socialMedia) user.socialMedia = req.body.socialMedia;

    await user.save(); // triggers the pre('save') for password

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
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
// GET: Unapproved users (e.g. role === "unapproved")
export const getApprovedUsers = async (req, res) => {
  try {
    const users = await User.find({ status: "approved" }).sort({ createdAt: -1 });
    console.log(users);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unapproved users." });
  }
};
// GET: Unapproved users (e.g. role === "unapproved")
export const getSuspendedUsers = async (req, res) => {
  console.log("suspension called ")
  try {
    const users = await User.find({ status: "suspended" }).sort({ createdAt: -1 });
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
      await User.findByIdAndUpdate(userId, { status: "approved" }); // or "admin", if needed
    } else {
      await User.findByIdAndDelete(userId);
    }

    res.json({ message: `User ${action}d successfully.` });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user." });
  }
};
// POST: suspension or unsuspension user
export const handleUserSuspension = async (req, res) => {
  const { userId, action } = req.body;
  
  if (!userId || !["suspend", "unsuspend"].includes(action)) {
    return res.status(400).json({ message: "Invalid request." });
  }

  try {
    if (action === "suspend") {
      await User.findByIdAndUpdate(userId, { status: "suspended" }); // or "admin", if needed
    } else {
      await User.findByIdAndUpdate(userId, { status: "approved" }); // or "admin", if needed
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

// Controller: Get user summary statistics
export const getUserSummary = async (req, res) => {
  try {
    const days = parseInt(req.params.days);
    const sinceDate = !isNaN(days)
      ? new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      : null;

    const [
      totalUsers,
      suspendedUsers,
      approvedUsers,
      declinedUsers,
      sellers,
      buyers,
      joinedRecently
    ] = await Promise.all([
      mongoose.model("User").countDocuments(),
      mongoose.model("User").countDocuments({ status: "suspended" }),
      mongoose.model("User").countDocuments({ status: "approved" }),
      mongoose.model("User").countDocuments({ status: "declined" }),
      mongoose.model("User").countDocuments({ role: "seller" }),
      mongoose.model("User").countDocuments({ role: "buyer" }),
      mongoose.model("User").countDocuments({ status: "unapproved" }),
    ]);

    res.json({
      totalUsers,
      suspendedUsers,
      approvedUsers,
      declinedUsers,
      joinedRecently,
      sellers,
      buyers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user summary." });
  }
};

// Add to wish list
export const addToWishList = async (req, res) => {
  try {
    const { userId } = req.params;
    const { carId } = req.body;
    if (!carId) return res.status(400).json({ message: "carId is required" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.wishList) user.wishList = [];
    const index = user.wishList.findIndex(id => id.toString() === carId);
    if (index > -1) {
      user.wishList.splice(index, 1);
      await user.save();
      console.log("removed from wishList ",carId)
      return res.status(200).json({ message: "Removed from wish list" });
    }
    user.wishList.push(carId);
    console.log("added to wishList ",carId)
    await user.save();
    res.status(200).json({ message: "Added to wish list" });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle wish list", error: err.message });
  }
};


// Get all wish list
export const getWishList = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate({
      path: "wishList",
      populate: { path: "user", select: "_id username email phoneNumber createdAt socialMedia" }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.wishList || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to get wish list", error: err.message });
  }
};



