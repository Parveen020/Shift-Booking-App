import React, { useState, useContext, useEffect } from "react";
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

const AvailableShifts = () => {
  const {
    areaMap,
    getAllShifts,
    bookShift,
    cancelShift,
    loadingStates,
    determineShiftStatus,
    formatTimeTo24Hour,
  } = useContext(shiftContext);

  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadShifts();
  }, []);

  useEffect(() => {
    if (Object.keys(areaMap).length > 0 && !selectedCity) {
      setSelectedCity(Object.keys(areaMap)[0]);
    }
  }, [areaMap]);

  const loadShifts = async () => {
    setLoading(true);
    setError(null);
    try {
      await getAllShifts();
    } catch (err) {
      setError("Failed to fetch shifts");
    } finally {
      setLoading(false);
    }
  };

  const handleBookShift = async (id) => {
    const result = await bookShift(id);
    alert(result.message);
  };

  const handleCancelShift = async (id) => {
    const result = await cancelShift(id);
    alert(result.message);
  };

  const ShiftCard = ({ shift }) => {
    const status = determineShiftStatus(shift);
    const now = new Date();
    const startTime = new Date(shift.startTime);

    const getStatusDisplay = () => {
      const statusStyles = {
        completed: styles.completedStatus,
        booked: styles.bookedStatus,
        "in-progress": styles.inProgressStatus,
        overlapping: styles.overlappingStatus,
      };
      return status in statusStyles ? (
        <Text style={statusStyles[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      ) : null;
    };

    const getActionButton = () => {
      const isLoading = loadingStates[shift.id];

      if (["completed", "overlapping", "in-progress"].includes(status)) {
        const buttonText = {
          completed: "Completed",
          overlapping: "Unavailable",
          "in-progress": "In Progress",
        }[status];
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.disabledButton]}
            disabled={true}
          >
            <Text style={styles.disabledButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        );
      }

      if (status === "booked" && startTime > now) {
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            disabled={!!isLoading}
            onPress={() => handleCancelShift(shift.id)}
          >
            {isLoading === "cancelling" ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color="#E2006A" />
              </View>
            ) : (
              <Text style={styles.cancelButtonText}>Cancel</Text>
            )}
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.bookButton]}
          disabled={!!isLoading}
          onPress={() => handleBookShift(shift.id)}
        >
          {isLoading === "booking" ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#48BB78" />
            </View>
          ) : (
            <Text style={styles.bookButtonText}>Book</Text>
          )}
        </TouchableOpacity>
      );
    };

    return (
      <View
        style={[
          styles.shiftCard,
          status === "completed" && styles.completedShiftCard,
        ]}
      >
        <View style={styles.shiftHeader}>
          <Text
            style={[
              styles.shiftTime,
              status === "completed" && styles.completedShiftTime,
            ]}
          >
            {formatTimeTo24Hour(shift.startTime)} -{" "}
            {formatTimeTo24Hour(shift.endTime)}
          </Text>
          <View style={styles.rightContent}>
            {getStatusDisplay()}
            {getActionButton()}
          </View>
        </View>
      </View>
    );
  };

  const renderCityTabs = () => {
    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>Error: {error}</Text>;
    if (Object.keys(areaMap).length === 0)
      return <Text>No cities available</Text>;

    return (
      <View style={styles.tabsBackground}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {Object.keys(areaMap).map((city) => (
            <TouchableOpacity
              key={city}
              onPress={() => setSelectedCity(city)}
              style={[
                styles.cityTab,
                selectedCity === city && styles.selectedTab,
              ]}
            >
              <Text
                style={[
                  styles.cityTabText,
                  selectedCity === city && styles.selectedTabText,
                ]}
              >
                {city}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderShifts = () => {
    if (!selectedCity || !areaMap[selectedCity]) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No shifts available.</Text>
        </View>
      );
    }

    const cityShifts = areaMap[selectedCity];
    if (Object.keys(cityShifts).length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            No shifts available for {selectedCity}.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.shiftsContainer}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(cityShifts)
          .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
          .map(([date, dayShifts]) => (
            <View key={date} style={styles.dayGroup}>
              <Text style={styles.dayLabel}>{date}</Text>
              {dayShifts
                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                .map((shift, idx) => (
                  <ShiftCard key={`${date}-${idx}`} shift={shift} />
                ))}
            </View>
          ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderCityTabs()}
      {renderShifts()}
      <View style={{ backgroundColor: "#ffffff" }}>
        <FooterMenu />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabsBackground: {
    backgroundColor: "#F0F3F8",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tabsContainer: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  cityTab: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginRight: 8,
    marginVertical: 4,
  },
  selectedTab: {
    backgroundColor: "#E6F0FF",
    borderRadius: 12,
  },
  cityTabText: {
    fontSize: 13,
    color: "#4F6C92",
    fontWeight: "400",
  },
  selectedTabText: {
    color: "#004FB4",
    fontWeight: "500",
  },
  shiftsContainer: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  dayGroup: {
    marginBottom: 16,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 8,
  },
  shiftCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedShiftCard: {
    opacity: 0.7,
  },
  shiftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shiftTime: {
    fontSize: 15,
    fontWeight: "400",
    color: "#2D3748",
  },
  completedShiftTime: {
    color: "#718096",
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
    height: 32,
  },
  bookButton: {
    borderWidth: 1,
    borderColor: "#48BB78",
    backgroundColor: "white",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#E2006A",
    backgroundColor: "white",
  },
  loaderContainer: {
    width: 42,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    borderWidth: 1,
    borderColor: "#CBD5E0",
    backgroundColor: "#EDF2F7",
  },
  bookButtonText: {
    color: "#48BB78",
    fontWeight: "500",
    fontSize: 13,
  },
  cancelButtonText: {
    color: "#E2006A",
    fontWeight: "500",
    fontSize: 13,
  },
  disabledButtonText: {
    color: "#718096",
    fontWeight: "500",
    fontSize: 13,
  },
  completedStatus: {
    color: "#718096",
    fontSize: 13,
    fontWeight: "400",
  },
  bookedStatus: {
    color: "#4A5568",
    fontSize: 13,
    fontWeight: "400",
  },
  inProgressStatus: {
    color: "#3182CE",
    fontSize: 13,
    fontWeight: "400",
  },
  overlappingStatus: {
    color: "#E2006A",
    fontSize: 13,
    fontWeight: "400",
  },
  spinner: {
    width: 15,
    height: 15,
  },
});

export default AvailableShifts;
