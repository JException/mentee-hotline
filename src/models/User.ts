import mongoose, { Schema, model, models } from "mongoose";

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
      max: 11,
    },
    accessKey: { type: String, default: "1234" },
  },
  {
    timestamps: true,
    // CHANGED: Use true instead of "throw" to prevent server crashes
    strict: true, 
  }
);

const User = models.User || model("User", UserSchema);
export default User;