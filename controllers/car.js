import Car from "../models/Car.js";
import User from "../models/User.js";

// @desc    Fetch all cars
// @route   GET /api/cars
export const getAllCars = async (req, res) => {
  try {
    const cars = await Car.find().populate("user", "_id username email");
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
      "_id username email"
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
// @desc    Recommend cars based on user's search history
// @route   GET /api/cars/recommendations/:userId
export const recommendCars = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user || user.searchHistory.length === 0) {
      return res.status(200).json([]);
    }

    const recentSearches = user.searchHistory.slice(-3);
    const queries = recentSearches.map((search) => {
      const q = {};
      if (search.brand) q.brand = search.brand;
      if (search.model) q.model = search.model;
      if (search.year) q.year = search.year;
      if (search.location) q["location.address"] = search.location;
      return q;
    });

    const recommendedCars = await Car.find({ $or: queries }).populate(
      "user",
      "_id username email"
    );
    res.status(200).json(recommendedCars);
  } catch (error) {
    console.error("Error fetching car recommendations:", error);
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
    }).populate("user", "username email");

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

    const cars = await Car.find(filters).populate("user", "username email");
    console.log("cars ", cars);
    res.status(200).json(cars);
  } catch (error) {
    console.error("Error filtering cars:", error);
    res.status(500).json({ message: "Server error" });
  }
};
