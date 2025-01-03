import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyShifts from "../pages/MyShifts";
import AvailableShifts from "../pages/AvailableShifts";

const ScreenMenu = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator initialRouteName="MyShifts">
      <Stack.Screen
        name="MyShifts"
        component={MyShifts}
        options={{ title: "Today..." }}
      />
      <Stack.Screen
        name="AvailableShifts"
        component={AvailableShifts}
        options={{ headerBackTitle: "Back" }}
      />
    </Stack.Navigator>
  );
};

export default ScreenMenu;
