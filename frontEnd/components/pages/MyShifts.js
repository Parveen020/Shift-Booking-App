import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { shiftContext } from "../../context/shiftContext";
import FooterMenu from "../menus/FooterMenu";

const MyShifts = () => {
  const {
    shifts,
    getAllShifts,
    cancelShift,
    groupShiftsByDate,
    formatTime,
    isShiftStarted,
    isShiftEnded,
    loadingStates,
    checkExpiredShifts,
  } = useContext(shiftContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (checkExpiredShifts(shifts)) {
        getAllShifts();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [shifts]);

  useEffect(() => {
    getAllShifts();
  }, []);

  const renderShiftItem = (shift) => {
    const started = isShiftStarted(shift.startTime);
    const ended = isShiftEnded(shift.endTime);
    const canCancel = !started && !ended && shift.isBooked;
    const isLoading = loadingStates[shift.id] === "cancelling";

    if (ended) return null;

    return (
      <View key={shift.id} style={styles.shiftItem}>
        <View style={styles.shiftInfo}>
          <Text style={styles.shiftTime}>
            {formatTime(shift.startTime)}-{formatTime(shift.endTime)}
          </Text>
          <Text style={styles.shiftArea}>{shift.area}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.cancelButton,
            !canCancel && styles.disabledButton,
            isLoading && styles.loadingButton,
          ]}
          disabled={!canCancel || isLoading}
          onPress={() => cancelShift(shift.id)}
        >
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#E2006A" />
            </View>
          ) : (
            <Text
              style={[
                styles.cancelButtonText,
                !canCancel && styles.disabledButtonText,
              ]}
            >
              Cancel
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const groupedShifts = groupShiftsByDate(shifts);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {Object.entries(groupedShifts).map(([date, { shifts, totalHours }]) => (
          <View key={date} style={styles.dateGroup}>
            <View style={styles.dateHeader}>
              <Text style={styles.dateTitle}>{date}</Text>
              <Text style={styles.shiftCount}>
                {shifts.length} shift{shifts.length !== 1 ? "s" : ""},{" "}
                {totalHours} h
              </Text>
            </View>
            {shifts.map(renderShiftItem)}
          </View>
        ))}
      </ScrollView>
      <FooterMenu />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  dateGroup: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A5568",
  },
  shiftCount: {
    fontSize: 14,
    color: "#A0AEC0",
  },
  shiftItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  shiftInfo: {
    flex: 1,
  },
  shiftTime: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2D3748",
    marginBottom: 4,
  },
  shiftArea: {
    fontSize: 14,
    color: "#A0AEC0",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2006A",
    minWidth: 70,
    height: 38,
  },
  cancelButtonText: {
    color: "#E2006A",
    fontSize: 14,
    fontWeight: "500",
  },
  disabledButton: {
    borderColor: "#CBD5E0",
    backgroundColor: "#F7FAFC",
  },
  disabledButtonText: {
    color: "#A0AEC0",
  },
  loaderContainer: {
    width: 42,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default MyShifts;
