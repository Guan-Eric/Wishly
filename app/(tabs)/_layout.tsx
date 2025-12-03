import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 2,
          borderTopColor: '#E7E5E4',
        },
        tabBarActiveTintColor: '#065F46',
        tabBarInactiveTintColor: '#78716C',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(group)"
        options={{
          title: 'My Groups',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="people" size={size} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="(search)"
        options={{
          title: 'Search Gifts',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="search" size={size} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="(wishlist)"
        options={{
          title: 'My Wishlist',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="heart" size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
