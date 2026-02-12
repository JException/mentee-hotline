import mongoose, { Schema, model, models } from "mongoose";

const ReplySchema = new mongoose.Schema({
  sender: { type: String, required: true }, // Name of person replying
  role: { type: String, required: true },   // "mentor" or "mentee"
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const TicketSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["OPEN", "RESOLVED"], 
      default: "OPEN"
    },
    group: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    imageUrl: { type: String }, 
    
    // 👇 THIS WAS MISSING. Add this line:
    replies: [ReplySchema], 
  },
  { timestamps: true }
);

// This check prevents "OverwriteModelError" in Next.js development
const Ticket = models.Ticket || model("Ticket", TicketSchema);
export default Ticket;