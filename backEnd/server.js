import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import shiftModel from "./model/shiftModel.js";
import mockShifts from "./shifts/mockShifts.js";
import shiftRouter from "./routes/shiftRoutes.js";

const app = express();
const port = 8080;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// db connection
connectDB();

// data export to database
const insertMockShifts = async () => {
  try {
    await shiftModel.insertMany(mockShifts);
    console.log("Mock shifts inserted successfully!");
  } catch (error) {
    console.error("Error inserting mock shifts:", error);
  }
};

// insertMockShifts();
// insertMockShifts();

app.use("/shifts", shiftRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
