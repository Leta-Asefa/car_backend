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
// @route   POST /api/cars
export const addCar = async (req, res) => {
  try {
    const uploader = async (buffer) => {
      return await cloudinary.uploader.upload_stream({ folder: "cars" }, (error, result) => {
        if (error) throw error;
        return result;
      }).end(buffer);
    };

    const files = req.files;

    const uploadPromises = files.map((file) =>
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "cars" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        uploadStream.end(file.buffer);
      })
    );

    const imageUrls = await Promise.all(uploadPromises);

    const carData = {
      ...req.body,
      images: imageUrls, // <-- Save the uploaded image URLs
    };

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
        price,
        location
      } = req.body; // GET DATA FROM BODY
  
      // Build dynamic filters
      if (title) filters.title = { $regex: title, $options: "i" };
      if (brand) filters.brand = { $regex: brand, $options: "i" };
      if (model) filters.model = { $regex: model, $options: "i" };
      if (year) filters.year = year;
      if (bodyType) filters.bodyType = { $regex: bodyType, $options: "i" };
      if (fuel) filters.fuel = { $regex: fuel, $options: "i" };
      if (mileage) filters.mileage = mileage;
      if (transmission) filters.transmission = { $regex: transmission, $options: "i" };
      if (color) filters.color = { $regex: color, $options: "i" };
      if (price) filters.price = price;
      if (location) filters["location.address"] = { $regex: location, $options: "i" };
  
      const cars = await Car.find(filters).populate("user", "username email");
  
      res.status(200).json(cars);
    } catch (error) {
      console.error("Error filtering cars:", error);
      res.status(500).json({ message: "Server error" });
    }
  };