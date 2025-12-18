import { Stack } from 'expo-router';

export default function GroupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="createOccasion" />
      <Stack.Screen name="occasion" />
      <Stack.Screen name="person-wishlist" />
      <Stack.Screen name="occasionDetail" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
