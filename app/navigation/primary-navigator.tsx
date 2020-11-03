import React from "react"
import { createNativeStackNavigator } from "react-native-screens/native-stack"
import { WelcomeScreen, DemoScreen } from "../screens"

export type PrimaryParamList = {
  welcome: undefined
  demo: undefined
}

const Stack = createNativeStackNavigator<PrimaryParamList>()

export function PrimaryNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="welcome" component={WelcomeScreen} />
      <Stack.Screen name="demo" component={DemoScreen} />
    </Stack.Navigator>
  )
}

const exitRoutes = ["welcome"]
export const canExit = (routeName: string) => exitRoutes.includes(routeName)
