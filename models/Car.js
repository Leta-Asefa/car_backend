import mongoose, { Schema } from "mongoose";

const LocationSchema = new Schema({
  address: { type: String, required: true },
  lon: { type: Number, required: true },
  lat: { type: Number, required: true },
});

const CarSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    brand: { type: String, required: true },
    year: { type: String, required: true },
    bodyType: { type: String, required: true },
    fuel: { type: String, required: true },
    mileage: { type: String },
    model: { type: String, required: true },
    transmission: { type: String, required: true },
    color: { type: String, required: true },
    vehicleDetails: { type: String, required: true },
    price: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    images: [{ type: String }], // <<< HERE you store multiple image URLs
    features: [{ type: String }], // <<< HERE you store multiple image URLs
    safety: [{ type: String }], // <<< HERE you store multiple image URLs
    status: { type: String, enum: ['approved', 'declined','unapproved','sold'], default: 'unapproved' },

  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Car", CarSchema);
