import mongoose, { Schema, model, models } from "mongoose";
import { unique } from "next/dist/build/utils";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      // Change required to false if some groups don't have unique emails yet
      required: false, 
      unique: true,
      sparse: true, // Allows multiple documents with null email
    },
    role: {
      type: String,
      enum: ["mentor", "mentee"],
      default: "mentee",
    },
    image: {
      type: String,
    },
    group: {
      type: Number, 
      min: 0,
    },
    accessKey: { type: String, default: "1234" },

    lastActiveAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    // CHANGED: Use true instead of "throw" to prevent server crashes
    strict: true, 
  }
);

const User = models.User || model("User", UserSchema);
export default User;