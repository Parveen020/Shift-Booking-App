import React, { createContext, useState } from "react";
import axios from "axios";

const shiftContext = createContext();

const shiftContextProvider = (props) => {
  const [shifts, setShifts] = useState([]);
  const url = "http://192.168.29.184:8080";
  const [areaMap, setAreaMap] = useState({});
  const [bookedShifts, setBookedShifts] = useState(new Set());
  const [loadingStates, setLoadingStates] = useState({});

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const groupShiftsByArea = (shiftsArray) => {
    if (!Array.isArray(shiftsArray) || shiftsArray.length === 0) {
      return {};
    }

    const areaGroups = {};
    shiftsArray.forEach((shift) => {
      if (shift.area) {
        if (!areaGroups[shift.area]) {
          areaGroups[shift.area] = [];
        }
        areaGroups[shift.area].push(shift);
      }
    });

    const finalAreaMap = {};
    Object.entries(areaGroups).forEach(([area, areaShifts]) => {
      finalAreaMap[area] = groupShiftsByDay(areaShifts);
    });

    return finalAreaMap;
  };

  const groupShiftsByDay = (shiftsArray) => {
    if (!Array.isArray(shiftsArray) || shiftsArray.length === 0) {
      return {};
    }

    const sortedShifts = [...shiftsArray].sort(
      (a, b) => (a.startTime || 0) - (b.startTime || 0)
    );

    const groupedByDay = {};
    sortedShifts.forEach((shift) => {
      const date = formatDate(shift.startTime);
      if (date) {
        if (!groupedByDay[date]) {
          groupedByDay[date] = [];
        }
        groupedByDay[date].push(shift);
      }
    });

    return groupedByDay;
  };

  const determineShiftStatus = (shift) => {
    if (!shift) return "unknown";

    const now = new Date();
    const startTime = new Date(shift.startTime);
    const endTime = new Date(shift.endTime);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return "unknown";
    }

    if (endTime < now) return "completed";
    if (shift.isBooked) {
      return startTime <= now && endTime > now ? "in-progress" : "booked";
    }

    const hasOverlap = shifts.some((otherShift) => {
      if (!otherShift || otherShift.id === shift.id || !otherShift.isBooked)
        return false;

      const otherStart = new Date(otherShift.startTime);
      const otherEnd = new Date(otherShift.endTime);

      if (isNaN(otherStart.getTime()) || isNaN(otherEnd.getTime()))
        return false;

      return startTime < otherEnd && endTime > otherStart;
    });

    return hasOverlap ? "overlapping" : "available";
  };

  const groupShiftsByDate = (shifts) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return shifts.reduce((acc, shift) => {
      if (!shift.isBooked) return acc;

      const shiftDate = new Date(shift.startTime);
      let dateKey = isSameDay(shiftDate, today)
        ? "Today"
        : isSameDay(shiftDate, tomorrow)
        ? "Tomorrow"
        : formatDateLong(shiftDate);

      if (!acc[dateKey]) {
        acc[dateKey] = {
          shifts: [],
          totalHours: 0,
        };
      }

      const durationHours =
        (new Date(shift.endTime) - new Date(shift.startTime)) /
        (1000 * 60 * 60);
      acc[dateKey].shifts.push(shift);
      acc[dateKey].totalHours += durationHours;

      return acc;
    }, {});
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const formatDateLong = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const isShiftStarted = (startTime) => new Date(startTime) < new Date();
  const isShiftEnded = (endTime) => new Date(endTime) < new Date();

  const checkExpiredShifts = (shifts) => {
    const currentTime = new Date();
    return shifts.some(
      (shift) => new Date(shift.endTime) < currentTime && shift.isBooked
    );
  };

  const getAllShifts = async () => {
    try {
      const { data } = await axios.get(`${url}/shifts`);

      if (data?.data) {
        const processedShifts = data.data.map((shift) => ({
          id: shift.id || shift._id,
          area: shift.area || "",
          startTime: shift.startTime || 0,
          endTime: shift.endTime || 0,
          isBooked: shift.booked || false,
        }));

        setShifts(processedShifts);

        if (processedShifts.length > 0) {
          const groupedByArea = groupShiftsByArea(processedShifts);
          setAreaMap(groupedByArea);
        } else {
          setAreaMap({});
        }
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
      setShifts([]);
      setAreaMap({});
    }
  };

  const bookShift = async (id) => {
    if (!id) {
      return { success: false, message: "Invalid shift ID" };
    }

    setLoadingStates((prev) => ({ ...prev, [id]: "booking" }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const response = await axios.post(`${url}/shifts/${id}/book`, {
        id,
      });
      if (response.status === 200 && response.data.success) {
        await getAllShifts();
        return { success: true, message: "Shift booked successfully" };
      }
      return {
        success: false,
        message: response.data.message || "Failed to book the shift",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "An unexpected error occurred",
      };
    } finally {
      setLoadingStates((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const cancelShift = async (id) => {
    if (!id) {
      return { success: false, message: "Invalid shift ID" };
    }

    setLoadingStates((prev) => ({ ...prev, [id]: "cancelling" }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const response = await axios.post(`${url}/shifts/${id}/cancel`, {
        id,
      });
      if (response.status === 200) {
        await getAllShifts();
        return { success: true, message: "Shift cancelled successfully" };
      }
      return { success: false, message: "Failed to cancel shift" };
    } catch (error) {
      return { success: false, message: "Failed to cancel shift" };
    } finally {
      setLoadingStates((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const formatTimeTo24Hour = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const contextValue = {
    url,
    shifts,
    areaMap,
    loadingStates,
    getAllShifts,
    bookShift,
    cancelShift,
    groupShiftsByDate,
    formatTime,
    isShiftStarted,
    isShiftEnded,
    checkExpiredShifts,
    determineShiftStatus,
    formatTimeTo24Hour,
  };

  return (
    <shiftContext.Provider value={contextValue}>
      {props.children}
    </shiftContext.Provider>
  );
};

export { shiftContextProvider, shiftContext };
