import express from "express";
import {
  getAllCars,
  getCarsByUser,
  addCar,
  recommendCars,
  updateCar,
  deleteCar,
  searchText,
  filterByAttributes,
  getCarSummary,
  updateCarApproval,
  getUnapprovedCars,
  getLatestCars,
  getCarSummaryByMonths
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
router.get("/summary", getCarSummary);
router.get("/lastestcars", getLatestCars);
router.get("/unapproved", getUnapprovedCars);
router.post("/approve", updateCarApproval);
router.get("/summary/:months", getCarSummaryByMonths);

export default router;
