import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useNavigation, useRoute } from "@react-navigation/native";

const FooterMenu = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [pressedButton, setPressedButton] = useState(null); // Track the pressed button

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          pressedButton === "MyShifts" && styles.pressedButton,
        ]}
        onPress={() => navigation.navigate("MyShifts")}
        onPressIn={() => setPressedButton("MyShifts")}
        onPressOut={() => setPressedButton(null)}
      >
        <FontAwesome5
          name="clock"
          style={[
            styles.iconStyles,
            pressedButton === "MyShifts" && styles.pressedIcon,
          ]}
          color={route.name === "MyShifts" ? "#004FB4" : "#4F6C92"}
        />
        <Text
          style={[
            styles.text,
            pressedButton === "MyShifts" && styles.pressedText,
          ]}
        >
          My Shifts
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          pressedButton === "AvailableShifts" && styles.pressedButton,
        ]}
        onPress={() => navigation.navigate("AvailableShifts")}
        onPressIn={() => setPressedButton("AvailableShifts")}
        onPressOut={() => setPressedButton(null)}
      >
        <FontAwesome5
          name="calendar-plus"
          style={[
            styles.iconStyles,
            pressedButton === "AvailableShifts" && styles.pressedIcon,
          ]}
          color={route.name === "AvailableShifts" ? "#004FB4" : "#4F6C92"}
        />
        <Text
          style={[
            styles.text,
            pressedButton === "AvailableShifts" && styles.pressedText,
          ]}
        >
          Available Shifts
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    margin: 10,
    justifyContent: "space-between",
  },
  button: {
    width: "50%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  pressedButton: {
    backgroundColor: "#E5F3FF",
    borderRadius: 10,
    padding: 5,
  },
  iconStyles: {
    marginBottom: 3,
    alignSelf: "center",
    fontSize: 25,
  },
  pressedIcon: {
    color: "#004FB4",
  },
  text: {
    color: "#4F6C92",
  },
  pressedText: {
    color: "#004FB4",
  },
});

export default FooterMenu;
