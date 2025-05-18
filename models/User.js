import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    password: { type: String, required: true },
    searchHistory: [
      {
        brand: String,
        model: String,
        location: String,
        year: String,
        ownerId: String,
        carId: { type: Schema.Types.ObjectId, ref: "Car" },
        date: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["approved", "declined", "unapproved", "suspended"],
      default: "unapproved",
    },
    wishList: [{ type: Schema.Types.ObjectId, ref: "Car" }],
    socialMedia: [
      {
        name: { type: String },
        link: { type: String },
      },
    ],
  },
  { timestamps: true } // <-- createdAt and updatedAt automatically handled
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
