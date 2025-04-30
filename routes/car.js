import express from "express";
import {
  getAllCars,
  getCarsByUser,
  addCar,
  recommendCars,
  updateCar,
  deleteCar,
  searchText,
  filterByAttributes
} from "../controllers/car.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Public Routes
router.get("/", getAllCars);
router.post("/add", addCar);
router.get("/user/:id", getCarsByUser);
router.get("/recommendations/:userId", recommendCars);

// Private Routes (should be protected later)

router.put("/:id", updateCar);
router.delete("/:id", deleteCar);
router.get("/search/:query", searchText);
router.post("/filter",filterByAttributes)

export default router;
