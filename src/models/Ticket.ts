import mongoose, { Schema, model, models } from "mongoose";

const TicketSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED"], 
      default: "OPEN" 
    },
    group: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String }, // For your vision of sending images (via URL)
  },
  { timestamps: true }
);

const Ticket = models.Ticket || model("Ticket", TicketSchema);
export default Ticket;