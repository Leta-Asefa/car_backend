import mongoose from "mongoose";
import Car from "../models/Car.js";
import User from "../models/User.js";

// @desc    Fetch all cars
// @route   GET /api/cars
export const getAllCars = async (req, res) => {
  try {
    const cars = await Car.find().populate("user", "_id username email phoneNumber createdAt");
    res.status(200).json(cars);
  } catch (error) {
    console.error("Error fetching all cars:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Fetch cars by user ID
// @route   GET /api/cars/user/:id
export const getCarsByUser = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const cars = await Car.find({ user: userId }).populate(
      "user",
      "_id username email phoneNumber createdAt"
    );
    res.status(200).json(cars);
  } catch (error) {
    console.error("Error fetching cars by user ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getCarsById = async (req, res) => {
  try {
    const { id} = req.params;
    const cars = await Car.findById(id).populate(
      "user",
      "_id username email phoneNumber createdAt"
    );
    res.status(200).json(cars);
  } catch (error) {
    console.error("Error fetching cars by user ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add a new car
export const addCar = async (req, res) => {
  console.log("Request body: add car hit", req.body);
  try {
    // Extract specific fields from req.body
    const {
      title,
      description,
      location,
      brand,
      year,
      bodyType,
      fuel,
      mileage,
      model,
      transmission,
      color,
      price,
      user,
      images,
    } = req.body;

    // Create a new car object with the extracted fields
    const carData = {
      title,
      description,
      location,
      brand,
      year,
      bodyType,
      fuel,
      mileage,
      model,
      transmission,
      color,
      price,
      user, // User ID
      images, // Array of image URLs
    };

    // Save the car data to the database
    const car = new Car(carData);
    await car.save();

    res.status(201).json({ message: "Car added successfully", car });
  } catch (error) {
    console.error("Error adding car:", error);
    res.status(500).json({ message: error.message });
  }
};

export const recommendCars = async (req, res) => {
  try {
    const { userId } = req.params;
    const excludeCarId = req.query.exclude;

    const user = await User.findById(userId);
    if (!user || user.searchHistory.length === 0) {
      // Fallback: Recent random cars
      const fallback = await Car.aggregate([
        { $match: { user: { $ne: new mongoose.Types.ObjectId(userId) } } },
        { $sample: { size: 6 } },
      ]);

      const populated = await Car.find({ _id: { $in: fallback.map(car => car._id) } })
        .populate("user", "_id username email phoneNumber createdAt");

      return res.status(200).json(populated);
    }

    const recentSearches = user.searchHistory.slice(-3);

    // Combine recent searches into OR queries
    const orQueries = recentSearches.map((s) => {
      const q = {};
      if (s.brand) q.brand = s.brand;
      if (s.model) q.model = s.model;
      if (s.year) q.year = s.year;
      return q;
    });

    const matchConditions = {
      $or: orQueries,
      user: { $ne: new mongoose.Types.ObjectId(userId) },
    };

    if (excludeCarId) {
      matchConditions._id = { $ne: new mongoose.Types.ObjectId(excludeCarId) };
    }

    // Main: sample random matches
    let recommendations = await Car.aggregate([
      { $match: matchConditions },
      { $sample: { size: 6 } }, // <== randomness here
    ]);

    // If nothing matched, fallback to random cars
    if (recommendations.length === 0) {
      recommendations = await Car.aggregate([
        { $match: { user: { $ne: new mongoose.Types.ObjectId(userId) } } },
        { $sample: { size: 6 } },
      ]);
    }

    // Populate user info
    const populated = await Car.find({ _id: { $in: recommendations.map(car => car._id) } })
      .populate("user", "_id username email phoneNumber createdAt");

    res.status(200).json(populated);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc    Update a car
// @route   PUT /api/cars/:id
export const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Update fields manually
    Object.assign(car, req.body);

    await car.save();
    res.status(200).json({ message: "Car updated successfully", car });
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a car
// @route   DELETE /api/cars/:id
export const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    await car.deleteOne(); // remove the car
    res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error("Error deleting car:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const searchText = async (req, res) => {
  try {
    const query = req.params.query;
console.log("query ",query)
const regex = new RegExp(query, "i"); // "i" for case-insensitive

    const cars = await Car.find({
      $or: [
        { title: regex },
        { brand: regex },
        { model: regex },
        { description: regex },
        { fuel: regex },
        { bodyType: regex },
        { color: regex },
        { transmission: regex },
        { year: regex },
        { price: regex },
        { "location.address": regex },
      ],
    }).populate("user", "username email phoneNumber createdAt");

    console.log("query ",cars)
    res.status(200).json(cars);
  } catch (error) {
    console.error("Error during car search:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const filterByAttributes = async (req, res) => {
  console.log("Filter ", req.body);
  try {
    const filters = {};
    const {
      title,
      brand,
      model,
      year,
      bodyType,
      fuel,
      mileage,
      transmission,
      color,
      location,
    } = req.body; // GET DATA FROM BODY

    // Build dynamic filters
    if (title && typeof title === "string")
      filters.title = { $regex: title, $options: "i" };
    if (brand && typeof brand === "string")
      filters.brand = { $regex: brand, $options: "i" };
    if (model && typeof model === "string")
      filters.model = { $regex: model, $options: "i" };
    if (year) filters.year = year;
    if (bodyType && typeof bodyType === "string")
      filters.bodyType = { $regex: bodyType, $options: "i" };
    if (fuel && typeof fuel === "string")
      filters.fuel = { $regex: fuel, $options: "i" };
    if (mileage) filters.mileage = mileage;
    if (transmission && typeof transmission === "string")
      filters.transmission = { $regex: transmission, $options: "i" };
    if (color && typeof color === "string")
      filters.color = { $regex: color, $options: "i" };
    if (req.body.priceRange) {
      filters.$expr = {
        $and: [
          { $gte: [{ $toDouble: "$price" }, req.body.priceRange.min] },
          { $lte: [{ $toDouble: "$price" }, req.body.priceRange.max] },
        ],
      };
    }
    if (location && typeof location === "string")
      filters["location.address"] = { $regex: location, $options: "i" };

    const cars = await Car.find(filters).populate("user", "username email phoneNumber createdAt");
    console.log("cars ", cars);
    res.status(200).json(cars);
  } catch (error) {
    console.error("Error filtering cars:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const getCarSummary = async (req, res) => {
  console.log("get car summary hit");
  try {
    const totalCars = await Car.countDocuments();

    const carsByBrand = await Car.aggregate([
      { $group: { _id: "$brand", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const avgPrice = await Car.aggregate([
      {
        $group: {
          _id: null,
          avgPrice: { $avg: { $toDouble: "$price" } }
        }
      }
    ]);

    const latestCars = await Car.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title price brand year");

    res.status(200).json({
      totalCars,
      carsByBrand,
      averagePrice: avgPrice[0]?.avgPrice?.toFixed(2) || 0,
      latestCars
    });
  } catch (error) {
    console.error("Error in car summary:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// GET unapproved cars
export const getUnapprovedCars = async (req, res) => {
  try {
    const cars = await Car.find({ status: "unapproved" }).populate("user", "name email phoneNumber createdAt");
    res.status(200).json(cars);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unapproved cars", error: err.message });
  }
};

export const getLatestCars = async (req, res) => {
  try {
    const cars = await Car.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("user", "name email phoneNumber createdAt");

    res.status(200).json(cars);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch latest cars",
      error: err.message,
    });
  }
};


// POST approve or decline
export const updateCarApproval = async (req, res) => {
  const { carId, action } = req.body;

  if (!["approve", "decline"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  try {
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    car.status = action === "approve" ? "approved" : "declined";
    await car.save();

    res.status(200).json({ message: `Car ${action}d successfully` });
  } catch (err) {
    res.status(500).json({ message: "Failed to update car status", error: err.message });
  }
};



export const getCarSummaryByMonths = async (req, res) => {
  const months = parseInt(req.params.months);
  if (isNaN(months) || months <= 0) {
    return res.status(400).json({ error: "Invalid months parameter" });
  }

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  try {
    const data = await Car.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // Format data to: [{ month: 'Jan 2024', count: 10 }, ...]
    const formatted = data.map(item => {
      const date = new Date(item._id.year, item._id.month - 1);
      return {
        month: date.toLocaleString("default", { month: "short", year: "numeric" }),
        count: item.count,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching summary:", err);
    res.status(500).json({ error: "Server error" });
  }
};