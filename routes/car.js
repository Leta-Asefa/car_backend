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
  getCarSummaryByMonths,
  getCarsById,
  getUsersOtherPost,
  getApprovedCars
} from "../controllers/car.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Public Routes
router.get("/", getAllCars);
router.post("/add", addCar);
router.get("/user/:id", getCarsByUser);
router.get("/get/:id", getCarsById);
router.get("/get_other_posts/:userId", getUsersOtherPost);
router.get("/recommendations/:userId", recommendCars);

// Private Routes (should be protected later)

router.get("/search/:query", searchText);
router.post("/filter",filterByAttributes)
router.get("/summary", getCarSummary);
router.get("/latestcars", getLatestCars);
router.get("/unapproved", getUnapprovedCars);
router.get("/approved", getApprovedCars);
router.post("/approve", updateCarApproval);
router.get("/summary/:months", getCarSummaryByMonths);
router.put("/:id", updateCar);
router.delete("/:id", deleteCar);

export default router;
