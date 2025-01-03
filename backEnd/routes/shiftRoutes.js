import express from "express";
import {
  bookShift,
  cancelShift,
  getAllShifts,
  getSpecificShifts,
} from "../controllers/shiftControllers.js";

const shiftRouter = express.Router();

shiftRouter.get("", getAllShifts);
shiftRouter.get("/:id", getSpecificShifts);
shiftRouter.post("/:id/book", bookShift);
shiftRouter.post("/:id/cancel", cancelShift);

export default shiftRouter;
