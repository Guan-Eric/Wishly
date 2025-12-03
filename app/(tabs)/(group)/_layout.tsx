import { Stack } from "expo-router";

export default function GroupLayout() {

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="createGroup" />
      <Stack.Screen name="group" />
      <Stack.Screen name="person-wishlist" />
      <Stack.Screen name="groupDetail" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
