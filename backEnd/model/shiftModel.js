import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const shiftSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: uuidv4 },
  area: {
    type: String,
    required: true,
    enum: ["Helsinki", "Tampere", "Turku"],
  },
  booked: { type: Boolean, required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
});

const shiftModel =
  mongoose.models.shift || mongoose.model("shift", shiftSchema);
export default shiftModel;
