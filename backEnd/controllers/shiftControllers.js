import mongoose from "mongoose";
import axios from "axios";
import shiftModel from "../model/shiftModel.js";

const getAllShifts = async (req, res) => {
  try {
    const shifts = await shiftModel.find(
      {},
      {
        id: 1,
        area: 1,
        booked: 1,
        department: 1,
        startTime: 1,
        endTime: 1,
      }
    );

    res.status(200).send({
      success: true,
      message: "All Shifts Retrieved Successfully",
      data: shifts,
    });
  } catch (error) {
    console.error("Fetching shifts error", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getSpecificShifts = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      console.log("id is not defined :)");
      return;
    }

    const shift = await shiftModel.findOne({ id });

    if (!shift) {
      res.status(500).json({ success: false, message: "Shift Not exist" });
    }

    res.status(201).json({
      success: true,
      message: "Shift extracted successfully",
      data: shift,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Error in Get Specific Shift" });
  }
};

const bookShift = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(404).json({
        success: false,
        message: "ID is required",
      });
    }

    const shiftToBook = await shiftModel.findOne({ id });

    if (!shiftToBook) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    if (shiftToBook.booked) {
      return res.status(404).json({
        success: false,
        message: "This shift is already booked",
      });
    }

    const currentTime = Date.now();
    if (currentTime > shiftToBook.startTime) {
      return res.status(404).json({
        success: false,
        message: "Cannot book a shift that has already started",
      });
    }

    const overlappingShift = await shiftModel.findOne({
      id: { $ne: id },
      area: shiftToBook.area,
      booked: true,
      $or: [
        {
          startTime: { $lte: shiftToBook.startTime },
          endTime: { $gt: shiftToBook.startTime },
        },
        {
          startTime: { $lt: shiftToBook.endTime },
          endTime: { $gte: shiftToBook.endTime },
        },
        {
          startTime: { $gte: shiftToBook.startTime },
          endTime: { $lte: shiftToBook.endTime },
        },
      ],
    });

    if (overlappingShift) {
      return res.status(404).json({
        success: false,
        message:
          "Cannot book this shift as it overlaps with another booked shift",
      });
    }

    const bookedShift = await shiftModel.findOneAndUpdate(
      { id },
      { booked: true },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Shift booked successfully :)",
      data: bookedShift,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in book shift API",
    });
  }
};

const cancelShift = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    const shiftToCancel = await shiftModel.findOne({ id });

    if (!shiftToCancel) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    if (shiftToCancel.booked === false) {
      return res.status(400).json({
        success: false,
        message: "This shift is already cancelled or not booked",
      });
    }

    const currentTime = Date.now();
    if (currentTime > shiftToCancel.startTime) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a shift that has already started",
      });
    }

    const cancelledShift = await shiftModel.findOneAndUpdate(
      { id },
      { booked: false },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Shift cancelled successfully :)",
      data: cancelledShift,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in cancel shift API",
    });
  }
};

export { getAllShifts, getSpecificShifts, bookShift, cancelShift };
