import { View } from "react-native";
import React from "react";
import ScreenMenu from "./components/menus/ScreenMenu";
import { shiftContextProvider as ShiftContextProvider } from "./context/shiftContext";

const Navigation = () => {
  return (
    <View style={{ flex: 1 }}>
      <ShiftContextProvider>
        <ScreenMenu />
      </ShiftContextProvider>
    </View>
  );
};

export default Navigation;
