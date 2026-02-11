import mongoose, { Schema, model, models } from "mongoose";

const MessageSchema = new Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links to the User model
      required: [true, "Sender ID is required"],
    },
    group: {
      type: Number,
      required: true, 
    },
    content: {
      type: String,
      required: [true, "Message content cannot be empty"],
      trim: true, // Removes whitespace from start/end
    },
    isPinned: { type: Boolean, default: false }, // ADD THIS
    
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: "throw", // Ensures no silent failures for extra fields
  }
);

const Message = models.Message || model("Message", MessageSchema);

export default Message;